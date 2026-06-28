'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { reviewApi } from '@/lib/api'
import { LuStar } from 'react-icons/lu'

interface ReviewFormProps {
  token: string
}

interface RatingCategory {
  key: 'rating' | 'doctor_professionalism' | 'waiting_time' | 'clinic_cleanliness' | 'staff_behavior' | 'overall_experience'
  label: string
  description?: string
}

const CATEGORIES: RatingCategory[] = [
  { key: 'rating', label: 'Overall Rating', description: 'Your overall rating for this appointment' },
  { key: 'doctor_professionalism', label: 'Doctor Professionalism', description: 'Rate the medical care and professionalism' },
  { key: 'waiting_time', label: 'Waiting Time', description: 'How long did you wait before your appointment?' },
  { key: 'clinic_cleanliness', label: 'Clinic Cleanliness', description: 'How clean was the facility?' },
  { key: 'staff_behavior', label: 'Staff Behavior', description: 'Were the receptionists and nurses helpful?' },
  { key: 'overall_experience', label: 'Overall Experience', description: 'Your general satisfaction with the visit' },
]

export default function ReviewForm({ token }: ReviewFormProps) {
  const router = useRouter()
  
  const [ratings, setRatings] = useState<Record<string, number>>({
    rating: 0,
    doctor_professionalism: 0,
    waiting_time: 0,
    clinic_cleanliness: 0,
    staff_behavior: 0,
    overall_experience: 0,
  })

  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({
    rating: 0,
    doctor_professionalism: 0,
    waiting_time: 0,
    clinic_cleanliness: 0,
    staff_behavior: 0,
    overall_experience: 0,
  })

  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRatingChange = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const handleHoverChange = (key: string, value: number) => {
    setHoverRatings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if any rating category is empty
    const unanswered = CATEGORIES.find((cat) => ratings[cat.key] === 0)
    if (unanswered) {
      setError(`Please provide a rating for "${unanswered.label}".`)
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    const response = await reviewApi.submitReview(token, {
      rating: ratings.rating,
      doctor_professionalism: ratings.doctor_professionalism,
      waiting_time: ratings.waiting_time,
      clinic_cleanliness: ratings.clinic_cleanliness,
      staff_behavior: ratings.staff_behavior,
      overall_experience: ratings.overall_experience,
      comment,
    })
    
    if (response.error) {
      setError(response.error)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setIsSubmitting(false)
    }
  }

  const renderStars = (categoryKey: string) => {
    const currentRating = ratings[categoryKey]
    const currentHover = hoverRatings[categoryKey]
    const displayRating = currentHover || currentRating

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => handleHoverChange(categoryKey, star)}
            onMouseLeave={() => handleHoverChange(categoryKey, 0)}
            onClick={() => handleRatingChange(categoryKey, star)}
          >
            <LuStar
              className={`w-8 h-8 ${
                displayRating >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-neutral-200 fill-neutral-100'
              } transition-colors duration-150`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8 bg-white border border-neutral-border shadow-sm rounded-2xl">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">Thank You!</h2>
        <p className="text-neutral-gray mb-6">
          Your review has been successfully submitted. We appreciate your feedback to improve our clinic!
        </p>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto p-6 md:p-8 bg-white border border-neutral-border shadow-sm rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Rating categories */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-dark border-b border-neutral-border pb-2">
            Appointment Questions
          </h2>
          
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-light/35 border border-neutral-border/40">
              <div>
                <label className="block text-sm font-semibold text-neutral-dark">
                  {cat.label}
                </label>
                {cat.description && (
                  <span className="text-xs text-neutral-gray block mt-0.5">
                    {cat.description}
                  </span>
                )}
              </div>
              <div className="shrink-0">
                {renderStars(cat.key)}
              </div>
            </div>
          ))}
        </div>

        {/* Comment field */}
        <div className="space-y-2">
          <Textarea
            label="Additional Notes (Optional)"
            placeholder="Tell us more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {error && (
          <div className="p-4 bg-error/10 text-error rounded-xl text-sm border border-error/20">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-3 text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  )
}
