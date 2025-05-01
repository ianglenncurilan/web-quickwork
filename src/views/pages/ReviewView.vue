<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  maxStars: {
    type: Number,
    default: 5,
  },
  initialRating: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    default: 'md',
  },
  color: {
    type: String,
    default: '#FFD700',
  },
})

const emit = defineEmits(['update:rating', 'submit'])

const rating = ref(props.initialRating)
const hoverRating = ref(0)
const review = ref('')
const name = ref('')
const submitted = ref(false)
const formError = ref('')

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xl'
    case 'lg':
      return 'text-4xl'
    default:
      return 'text-2xl'
  }
})

const starClasses = computed(() => {
  return `${sizeClass.value} transition-all duration-200 cursor-pointer`
})

const setRating = (value) => {
  rating.value = value
  emit('update:rating', value)
}

const handleMouseOver = (index) => {
  hoverRating.value = index
}

const handleMouseLeave = () => {
  hoverRating.value = 0
}

const isStarFilled = (index) => {
  if (hoverRating.value > 0) {
    return index <= hoverRating.value
  }
  return index <= rating.value
}

const getStarColor = (index) => {
  return isStarFilled(index) ? props.color : '#e0e0e0'
}

const submitReview = () => {
  if (!rating.value) {
    formError.value = 'Please select a rating before submitting'
    return
  }

  if (!name.value.trim()) {
    formError.value = 'Please enter your name'
    return
  }

  const reviewData = {
    name: name.value,
    rating: rating.value,
    review: review.value,
    date: new Date().toISOString(),
  }

  emit('submit', reviewData)
  submitted.value = true
  formError.value = ''
}

const resets = () => {
  submitted.value = false
  rating.value = 0
  review.value = ''
  name.value = ''
  formError.value = ''
}
</script>

<template>
  <div class="review-container">
    <div v-if="!submitted" class="review-form">
      <h2 class="form-title">Write a Review</h2>

      <div class="rating-container">
        <label class="rating-label ">Your Rating</label>
        <div class="stars-container">
          <span
            v-for="index in maxStars"
            :key="index"
            class="star"
            :class="starClasses"
            @click="setRating(index)"
            @mouseover="handleMouseOver(index)"
            @mouseleave="handleMouseLeave"
            :style="{ color: getStarColor(index) }"
          >
            ★
          </span>
          <span class="rating-text" v-if="rating > 0"> {{ rating }} of {{ maxStars }} </span>
        </div>
      </div>

      <div class="form-group">
        <label for="name">Your Name</label>
        <input
          type="text"
          id="name"
          v-model="name"
          placeholder="Enter your name"
          class="form-input"
        />
      </div>



      <div class="form-group">
        <label for="review">Your Review</label>
        <textarea
          id="review"
          v-model="review"
          placeholder="Tell us about your experience..."
          class="form-textarea"
        ></textarea>
      </div>

      <p v-if="formError" class="error-message">{{ formError }}</p>

      <button @click="submitReview" class="submit-button">Submit Review</button>
    </div>

    <div v-else class="submission-success">
      <div class="success-content">
        <h2>Thank You!</h2>
        <p>Your review has been submitted successfully.</p>
        <button @click="resets" class="reset-button">Write Another Review</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #333;
}

.form-title,
.reviews-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #222;
}

.rating-container {
  margin-bottom: 24px;
}

.rating-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.stars-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  cursor: pointer;
  transition:
    transform 0.2s,
    color 0.2s;
}

.star:hover {
  transform: scale(1.2);
}

.rating-text {
  margin-left: 12px;
  font-size: 14px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.error-message {
  color: #e53935;
  font-size: 14px;
  margin-bottom: 16px;
}

.submit-button,
.reset-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.submit-button:hover,
.reset-button:hover {
  background-color: #3a7bc8;
  transform: translateY(-2px);
}

.submission-success {
  background-color: #f0f9eb;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  margin-bottom: 40px;
  border: 1px solid #e1f3d8;
}

.success-content h2 {
  color: #67c23a;
  margin-bottom: 12px;
}

.reset-button {
  margin-top: 20px;
  background-color: #67c23a;
}

.reset-button:hover {
  background-color: #5daf33;
}

/* Added animations and enhanced visuals */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.submission-success {
  animation: pulse 2s ease-in-out;
}

.star:hover {
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
}

/* Responsive styling */
@media (max-width: 640px) {
  .review-container {
    padding: 20px 15px;
  }

  .form-title {
    font-size: 20px;
  }

  .submit-button,
  .reset-button {
    width: 100%;
  }
}
</style>
