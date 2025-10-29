'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { getCDNUrl, getOptimizedImageUrl, generateResponsiveSrcSet, cdnConfig } from '@/lib/cdn-config'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  fallbackSrc?: string
  enableWebP?: boolean
  enableAVIF?: boolean
  quality?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackSrc,
  enableWebP = true,
  enableAVIF = false,
  quality = 85,
  priority = false,
  loading = 'lazy',
  className,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Handle image load errors
  const handleError = () => {
    if (!imageError && fallbackSrc) {
      setImageError(true)
      setCurrentSrc(fallbackSrc)
    }
  }

  // Get optimized image URL
  const getImageSrc = (format?: 'webp' | 'avif' | 'jpeg' | 'png') => {
    if (cdnConfig.enabled) {
      return getOptimizedImageUrl(
        currentSrc,
        typeof width === 'number' ? width : undefined,
        typeof height === 'number' ? height : undefined,
        quality,
        format
      )
    }
    return currentSrc
  }

  // Generate responsive srcSet
  const getSrcSet = (format?: 'webp' | 'avif' | 'jpeg' | 'png') => {
    if (cdnConfig.enabled && typeof width === 'number') {
      const sizes = [width, width * 1.5, width * 2].filter(size => size <= 3840)
      return generateResponsiveSrcSet(currentSrc, sizes, format)
    }
    return undefined
  }

  return (
    <picture>
      {/* AVIF format (best compression, modern browsers) */}
      {enableAVIF && cdnConfig.enabled && (
        <source
          srcSet={getSrcSet('avif')}
          type="image/avif"
          sizes={props.sizes}
        />
      )}
      
      {/* WebP format (good compression, wide support) */}
      {enableWebP && cdnConfig.enabled && (
        <source
          srcSet={getSrcSet('webp')}
          type="image/webp"
          sizes={props.sizes}
        />
      )}
      
      {/* Fallback to original format */}
      <Image
        src={getImageSrc()}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loading}
        className={className}
        onError={handleError}
        {...props}
      />
    </picture>
  )
}

// Preset components for common use cases
export function HeroImage(props: Omit<OptimizedImageProps, 'priority' | 'loading'>) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      loading="eager"
      enableAVIF={true}
      quality={90}
    />
  )
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, 'quality'>) {
  return (
    <OptimizedImage
      {...props}
      quality={75}
      enableWebP={true}
    />
  )
}

export function ProfileImage(props: Omit<OptimizedImageProps, 'fallbackSrc'>) {
  return (
    <OptimizedImage
      {...props}
      fallbackSrc="/images/default-avatar.svg"
      quality={80}
      enableWebP={true}
    />
  )
}

export default OptimizedImage