const REVIEWS_STORAGE_KEY = 'civic_service_reviews';

const SEED_REVIEWS = [
  {
    id: 'rev-seed-1',
    serviceId: 'passport-new',
    citizenName: 'Aditya Sharma',
    date: '2026-09-15',
    rating: 5,
    easeRating: 5,
    speedRating: 4,
    staffRating: 5,
    waitTimeHours: '1.5 hrs',
    reviewText: 'PSK slot was very punctual. Carry original 10th marksheet and Aadhaar with exact name matching. Police verification took 4 days and passport arrived in 8 days.',
    tips: 'Reach 20 minutes before your appointment batch time. Token system inside is very orderly.',
    verified: true,
    upvotes: 28
  },
  {
    id: 'rev-seed-2',
    serviceId: 'passport-new',
    citizenName: 'Meera Krishnan',
    date: '2026-09-02',
    rating: 4,
    easeRating: 4,
    speedRating: 4,
    staffRating: 4,
    waitTimeHours: '2 hrs',
    reviewText: 'Smooth digital process. Ensure you have SMS receipt on phone. Counters A and B went fast, Counter C had a small queue.',
    tips: 'Take self-attested photocopies of all originals beforehand; photostat charges inside are high.',
    verified: true,
    upvotes: 14
  },
  {
    id: 'rev-seed-3',
    serviceId: 'driving-license-learning',
    citizenName: 'Rohan Deshmukh',
    date: '2026-08-28',
    rating: 5,
    easeRating: 5,
    speedRating: 5,
    staffRating: 4,
    waitTimeHours: '0.5 hrs',
    reviewText: 'The online learner license test on Sarathi portal was seamless using Aadhaar e-KYC. Did not need to visit RTO at all!',
    tips: 'Practice road signs mock test on the portal first. 12 out of 15 correct answers required to pass.',
    verified: true,
    upvotes: 35
  },
  {
    id: 'rev-seed-4',
    serviceId: 'aadhaar-address-update',
    citizenName: 'Pooja Verma',
    date: '2026-09-10',
    rating: 4,
    easeRating: 4,
    speedRating: 3,
    staffRating: 4,
    waitTimeHours: '1 hr',
    reviewText: 'Updated address using bank passbook with photo. Update took approximately 5 calendar days to reflect online.',
    tips: 'Ensure your phone number is linked with Aadhaar to receive OTP for validation.',
    verified: true,
    upvotes: 19
  }
];

export const reviewStorage = {
  getStoredReviews() {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
        return SEED_REVIEWS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_REVIEWS;
    }
  },

  getReviewsForService(serviceId) {
    const all = this.getStoredReviews();
    return all.filter(r => r.serviceId === serviceId);
  },

  addReview({ serviceId, citizenName, rating, easeRating = 4, speedRating = 4, staffRating = 4, reviewText, tips = '', waitTimeHours = '1 hr' }) {
    const all = this.getStoredReviews();
    const newReview = {
      id: `rev-${Date.now()}`,
      serviceId,
      citizenName: citizenName || 'Verified Citizen',
      date: new Date().toISOString().split('T')[0],
      rating: Number(rating),
      easeRating: Number(easeRating),
      speedRating: Number(speedRating),
      staffRating: Number(staffRating),
      waitTimeHours,
      reviewText,
      tips,
      verified: true,
      upvotes: 0
    };

    const updated = [newReview, ...all];
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    return newReview;
  },

  upvoteReview(reviewId) {
    const all = this.getStoredReviews();
    const updated = all.map(r => {
      if (r.id === reviewId) {
        return { ...r, upvotes: (r.upvotes || 0) + 1 };
      }
      return r;
    });
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  getAggregate(serviceId) {
    const reviews = this.getReviewsForService(serviceId);
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 4.8,
        easeScore: 4.6,
        speedScore: 4.5,
        staffScore: 4.7,
        recommendationRate: 94,
        distribution: { 5: 80, 4: 15, 3: 5, 2: 0, 1: 0 }
      };
    }

    const total = reviews.length;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const avgEase = reviews.reduce((sum, r) => sum + (r.easeRating || r.rating), 0) / total;
    const avgSpeed = reviews.reduce((sum, r) => sum + (r.speedRating || r.rating), 0) / total;
    const avgStaff = reviews.reduce((sum, r) => sum + (r.staffRating || r.rating), 0) / total;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (distribution[rounded] !== undefined) distribution[rounded]++;
    });

    const recommendCount = reviews.filter(r => r.rating >= 4).length;

    return {
      totalReviews: total,
      averageRating: parseFloat(avg.toFixed(1)),
      easeScore: parseFloat(avgEase.toFixed(1)),
      speedScore: parseFloat(avgSpeed.toFixed(1)),
      staffScore: parseFloat(avgStaff.toFixed(1)),
      recommendationRate: Math.round((recommendCount / total) * 100),
      distribution
    };
  }
};
