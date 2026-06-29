'use client'

import React, { useEffect, useState } from 'react'
import { reviewApi } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { LuMessageSquare, LuCalendar, LuUser, LuStar, LuBuilding2, LuClock, LuHeartHandshake, LuShieldCheck, LuSparkles } from 'react-icons/lu'
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  rating: number
  doctor_professionalism: number
  waiting_time: number
  clinic_cleanliness: number
  staff_behavior: number
  overall_experience: number
  comment: string
  created_at: string
  appointment_details?: {
    patient_name: string
    start_datetime: string
    doctor_name: string
  }
}

function HospitalReviewsContent() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { planType, isActive, loading: subLoading } = useSubscription()
  const isPremium = isActive && (planType === 'STANDARD' || planType === 'PREMIUM')

  useEffect(() => {
    if (subLoading) return
    if (!isPremium) {
      setIsLoading(false)
      return
    }

    const fetchReviews = async () => {
      try {
        const response = await reviewApi.getAdminReviews()
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setReviews(response.data.results || [])
        }
      } catch (err) {
        setError('Failed to load reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [isPremium, subLoading])

  const renderStars = (rating: number, size = 4) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <LuStar
            key={star}
            className={`w-${size} h-${size} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200 fill-neutral-200'
            }`}
          />
        ))}
      </div>
    )
  }

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'doctor_professionalism':
        return <LuShieldCheck className="text-blue-500" size={14} />
      case 'waiting_time':
        return <LuClock className="text-amber-500" size={14} />
      case 'clinic_cleanliness':
        return <LuBuilding2 className="text-teal-500" size={14} />
      case 'staff_behavior':
        return <LuHeartHandshake className="text-indigo-500" size={14} />
      case 'overall_experience':
        return <LuSparkles className="text-purple-500" size={14} />
      default:
        return <LuStar className="text-yellow-500" size={14} />
    }
  }

  if (subLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-gray animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto w-full pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <LuMessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Patient Reviews</h1>
            <p className="text-neutral-gray text-sm mt-1">
              Detailed performance metrics and qualitative feedback from completed appointments.
            </p>
          </div>
        </div>
        
        {isPremium && (
          <div className="bg-neutral-light px-4 py-2 rounded-lg border border-neutral-border flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-xs font-semibold text-neutral-gray uppercase tracking-wider">Total Reviews</span>
            <span className="text-2xl font-bold text-primary">{reviews.length}</span>
          </div>
        )}
      </div>

      {!isPremium ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center shadow-sm max-w-2xl mx-auto mt-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4">
            <LuMessageSquare size={28} />
          </div>
          <h3 className="text-lg font-bold text-blue-900 mb-2">Premium Feature Required</h3>
          <p className="text-blue-800 text-sm max-w-md mb-6 leading-relaxed">
            The patient review and rating system is only available in the <strong className="font-semibold text-blue-950">Premium Plan</strong>. Upgrade your subscription plan to collect detailed patient feedback and view review metrics.
          </p>
          <button
            onClick={() => router.push('/dashboard/hospital/setup')}
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transform duration-150"
          >
            Upgrade to Premium Plan
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-error/10 text-error p-4 rounded-xl text-sm border border-error/20 flex items-center gap-3">
              <LuMessageSquare className="shrink-0" />
              {error}
            </div>
          )}

          {/* Reviews Grid */}
          {reviews.length === 0 && !error ? (
            <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center text-neutral-gray mb-4">
                <LuMessageSquare size={32} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-dark mb-2">No Reviews Yet</h3>
              <p className="text-neutral-gray max-w-md">
                Once patients complete their appointments and submit their feedback, their reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 items-start">
              {reviews.map((review) => {
                const dateObj = new Date(review.created_at)
                const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                const appointmentDate = review.appointment_details?.start_datetime 
                  ? new Date(review.appointment_details.start_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Unknown Date'
                  
                const metrics = [
                  { label: 'Doctor Professionalism', value: review.doctor_professionalism, key: 'doctor_professionalism' },
                  { label: 'Waiting Time', value: review.waiting_time, key: 'waiting_time' },
                  { label: 'Clinic Cleanliness', value: review.clinic_cleanliness, key: 'clinic_cleanliness' },
                  { label: 'Staff Behavior', value: review.staff_behavior, key: 'staff_behavior' },
                  { label: 'Overall Experience', value: review.overall_experience, key: 'overall_experience' },
                ]

                return (
                  <Card 
                    key={review.id} 
                    className="group flex flex-col h-full bg-white border border-neutral-border hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Review Header - Overall Rating */}
                    <div className="p-5 border-b border-neutral-border/50 bg-neutral-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 5)}
                        <span className="text-sm font-bold text-neutral-dark">{review.rating}</span>
                      </div>
                      <div className="text-right text-xs text-neutral-gray">
                        <div>{dateStr}</div>
                        <div className="text-[10px]">{timeStr}</div>
                      </div>
                    </div>
                    
                    {/* Metric Breakdown */}
                    <div className="px-5 pt-4 pb-2 border-b border-neutral-border/30 bg-neutral-50/20">
                      <div className="space-y-2">
                        {metrics.map((m) => (
                          <div key={m.key} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 text-neutral-gray">
                              {getMetricIcon(m.key)}
                              <span>{m.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(m.value || 5, 3)}
                              <span className="font-semibold text-neutral-dark w-3 text-right">{m.value || 5}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comment Body */}
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <div className="relative">
                        <span className="absolute -top-3 -left-2 text-4xl text-primary/10 font-serif leading-none">"</span>
                        <p className="text-neutral-dark text-sm leading-relaxed italic relative z-10 pl-2">
                          {review.comment || <span className="text-neutral-400 not-italic">No additional comments provided.</span>}
                        </p>
                      </div>
                    </div>
                    
                    {/* Details Footer */}
                    <div className="bg-neutral-light/50 p-4 mt-auto border-t border-neutral-border text-xs flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-neutral-dark font-medium">
                        <LuUser className="text-primary shrink-0" size={14} />
                        <span className="truncate">{review.appointment_details?.patient_name || 'Anonymous Patient'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-gray">
                        <LuCalendar className="shrink-0" size={14} />
                        <span className="truncate">Appt: {appointmentDate} • Dr. {review.appointment_details?.doctor_name || 'Unknown'}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function HospitalReviewsPage() {
  return (
    <SubscriptionProvider>
      <HospitalReviewsContent />
    </SubscriptionProvider>
  )
}
