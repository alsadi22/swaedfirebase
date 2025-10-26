/**
 * Firebase Cloud Functions for SwaedUAE Platform
 * 
 * This file contains serverless functions for:
 * - User management
 * - Event notifications
 * - Certificate generation
 * - Automated tasks
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

/**
 * Trigger: When a new user is created
 * Creates a user document in Firestore
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const userDoc = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      profilePicture: user.photoURL || null,
      role: 'VOLUNTEER', // Default role
      status: 'ACTIVE',
      emailVerified: user.emailVerified,
      totalHours: 0,
      totalEvents: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(user.uid).set(userDoc);
    
    functions.logger.info(`User document created for: ${user.email}`);
  } catch (error) {
    functions.logger.error('Error creating user document:', error);
  }
});

/**
 * Trigger: When a user is deleted
 * Cleans up user-related data
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document
    await db.collection('users').doc(user.uid).delete();
    
    // Clean up user's applications, attendance records, etc.
    const batch = db.batch();
    
    // Delete applications
    const applications = await db.collection('applications')
      .where('userId', '==', user.uid)
      .get();
    applications.forEach(doc => batch.delete(doc.ref));
    
    // Delete notifications
    const notifications = await db.collection('notifications')
      .where('userId', '==', user.uid)
      .get();
    notifications.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    
    functions.logger.info(`User data cleaned up for: ${user.email}`);
  } catch (error) {
    functions.logger.error('Error deleting user data:', error);
  }
});

/**
 * HTTP Function: Send email notification
 * Callable function to send emails
 */
export const sendEmailNotification = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send notifications'
    );
  }

  const { to, subject, body, type } = data;

  try {
    // Create notification document
    const notification = {
      userId: to,
      type: type || 'INFO',
      title: subject,
      message: body,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('notifications').add(notification);

    // TODO: Integrate with email service (Nodemailer, SendGrid, etc.)
    // For now, just create in-app notification
    
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    functions.logger.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

/**
 * Scheduled Function: Update event statuses
 * Runs daily to update event statuses based on dates
 */
export const updateEventStatuses = functions.pubsub
  .schedule('0 0 * * *') // Every day at midnight
  .timeZone('Asia/Dubai')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      const batch = db.batch();

      // Find events that should be marked as completed
      const completedEvents = await db.collection('events')
        .where('status', '==', 'ONGOING')
        .where('dateTime.endDate', '<', now)
        .get();

      completedEvents.forEach(doc => {
        batch.update(doc.ref, {
          status: 'COMPLETED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Find events that should be marked as ongoing
      const ongoingEvents = await db.collection('events')
        .where('status', '==', 'PUBLISHED')
        .where('dateTime.startDate', '<=', now)
        .where('dateTime.endDate', '>=', now)
        .get();

      ongoingEvents.forEach(doc => {
        batch.update(doc.ref, {
          status: 'ONGOING',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      functions.logger.info(
        `Updated ${completedEvents.size} completed events and ${ongoingEvents.size} ongoing events`
      );

      return null;
    } catch (error) {
      functions.logger.error('Error updating event statuses:', error);
      return null;
    }
  });

/**
 * Trigger: When attendance is checked out
 * Automatically calculates volunteer hours
 */
export const calculateVolunteerHours = functions.firestore
  .document('attendance/{attendanceId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if checkout was just completed
    if (!before.checkOut && after.checkOut) {
      try {
        const checkInTime = after.checkIn.timestamp.toDate();
        const checkOutTime = after.checkOut.timestamp.toDate();
        
        // Calculate hours
        const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const hoursRounded = Math.round(hours * 100) / 100;

        // Update attendance record with calculated hours
        await change.after.ref.update({
          hoursCompleted: hoursRounded,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update user's total hours
        const userRef = db.collection('users').doc(after.userId);
        await userRef.update({
          totalHours: admin.firestore.FieldValue.increment(hoursRounded),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(
          `Calculated ${hoursRounded} hours for user ${after.userId}`
        );
      } catch (error) {
        functions.logger.error('Error calculating hours:', error);
      }
    }
  });

/**
 * HTTP Function: Generate certificate
 * Callable function to generate and store certificates
 */
export const generateCertificate = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { attendanceId } = data;

  try {
    // Get attendance record
    const attendanceDoc = await db.collection('attendance').doc(attendanceId).get();
    if (!attendanceDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Attendance record not found');
    }

    const attendance = attendanceDoc.data();
    
    // Verify user has permission
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    
    const eventDoc = await db.collection('events').doc(attendance!.eventId).get();
    const eventData = eventDoc.data();

    if (
      userData?.role !== 'ORG_ADMIN' &&
      userData?.organizationId !== eventData?.organizationId &&
      !['ADMIN', 'SUPER_ADMIN'].includes(userData?.role || '')
    ) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions to generate certificate'
      );
    }

    // Generate unique certificate number
    const certificateNumber = `SWD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();

    // Create certificate record
    const certificate = {
      userId: attendance!.userId,
      eventId: attendance!.eventId,
      organizationId: eventData!.organizationId,
      certificateNumber,
      verificationCode,
      status: 'ISSUED',
      hoursCompleted: attendance!.hoursCompleted || 0,
      issueDate: admin.firestore.FieldValue.serverTimestamp(),
      pdfUrl: '', // Will be updated after PDF generation
      metadata: {
        volunteerName: '', // Fetch from user doc
        eventTitle: eventData!.title,
        organizationName: eventData!.organizationName,
        eventDate: eventData!.dateTime.startDate,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const certRef = await db.collection('certificates').add(certificate);

    // TODO: Generate PDF certificate using jsPDF or similar
    // TODO: Upload PDF to Firebase Storage
    // TODO: Update certificate record with PDF URL

    return {
      success: true,
      certificateId: certRef.id,
      certificateNumber,
    };
  } catch (error) {
    functions.logger.error('Error generating certificate:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate certificate');
  }
});
