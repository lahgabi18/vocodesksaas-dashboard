import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant dans .env.local')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
})

export const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_1TZHiX6yi8jjAN3ciDTKITC5'
