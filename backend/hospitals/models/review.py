from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Review(models.Model):
    """Patient feedback for an appointment."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # We use a OneToOneField to enforce one review per appointment
    appointment = models.OneToOneField(
        'hospitals.Appointment', 
        on_delete=models.CASCADE,
        related_name='review'
    )
    
    doctor = models.ForeignKey(
        'hospitals.Doctor',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    
    website_setup = models.ForeignKey(
        'core.WebsiteSetup',
        on_delete=models.CASCADE,
        related_name='hospital_reviews'
    )
    
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    doctor_professionalism = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    waiting_time = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    clinic_cleanliness = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    staff_behavior = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    overall_experience = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'hospital_reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.appointment.patient_name} - {self.rating} stars"
