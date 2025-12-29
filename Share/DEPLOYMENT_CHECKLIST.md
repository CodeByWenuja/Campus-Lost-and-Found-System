# Production Deployment Checklist

Use this checklist to ensure your Lost & Found app is production-ready.

## Pre-Deployment

### Database Setup
- [ ] Supabase project created
- [ ] Database migrations executed successfully
- [ ] Row Level Security (RLS) policies verified
- [ ] Database indexes created
- [ ] At least one admin user added to `admins` table

### Storage Configuration
- [ ] `images` bucket created in Supabase Storage
- [ ] Bucket set to **Public** access
- [ ] Storage policies configured for authenticated uploads
- [ ] CORS settings verified

### Authentication
- [ ] Email authentication enabled
- [ ] Email templates customized (optional)
- [ ] OAuth providers configured (Google, GitHub - optional)
- [ ] Auth redirect URLs added for production domain
- [ ] Password strength requirements reviewed

### Environment Variables
- [ ] All environment variables documented
- [ ] VAPID keys generated for push notifications
- [ ] Production URLs configured
- [ ] Sensitive keys secured (not in git)

## Vercel Deployment

### Initial Setup
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project framework detected as Next.js
- [ ] Build settings verified

### Environment Configuration
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `PUSH_VAPID_PUBLIC` added
- [ ] `PUSH_VAPID_PRIVATE` added
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL

### Deployment
- [ ] First deployment successful
- [ ] Build logs reviewed for errors
- [ ] Production site accessible

## Post-Deployment

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] User can sign up and sign in
- [ ] User can create a new post with images
- [ ] Images upload and display correctly
- [ ] Item detail page works
- [ ] Comments functionality works
- [ ] Claim functionality works
- [ ] Profile page displays correctly
- [ ] Leaderboard shows data
- [ ] Admin dashboard accessible (for admin users)

### PWA Testing
- [ ] PWA manifest loads correctly
- [ ] App can be installed on mobile
- [ ] Service worker registers successfully
- [ ] Offline functionality works
- [ ] Push notifications work (if enabled)

### Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Images optimized and loading fast
- [ ] No console errors in production

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] RLS policies tested
- [ ] Admin access restricted
- [ ] API keys not exposed in client
- [ ] CORS policies correct

### Monitoring
- [ ] Error tracking set up (optional: Sentry)
- [ ] Analytics configured (optional: Google Analytics)
- [ ] Vercel Analytics enabled
- [ ] Supabase logs reviewed

## CI/CD

### GitHub Actions
- [ ] CI workflow tested and passing
- [ ] Secrets added to GitHub repository
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Deploy workflow tested
- [ ] Automatic deployments work on push to main

## Documentation

- [ ] README.md complete and accurate
- [ ] Environment variables documented
- [ ] Setup instructions tested
- [ ] API documentation available (if applicable)
- [ ] User guide created (optional)

## Domain & DNS (Optional)

- [ ] Custom domain purchased
- [ ] DNS records configured in Vercel
- [ ] SSL certificate issued
- [ ] WWW redirect configured
- [ ] Domain verified and working

## User Communication

- [ ] Users notified of launch
- [ ] Support email configured
- [ ] Feedback mechanism in place
- [ ] Social media presence (optional)

## Backup & Recovery

- [ ] Database backup strategy defined
- [ ] Storage backup enabled
- [ ] Point-in-time recovery tested (Supabase)
- [ ] Disaster recovery plan documented

## Legal & Compliance

- [ ] Terms of Service drafted (if required)
- [ ] Privacy Policy created (if required)
- [ ] Cookie consent implemented (if in EU)
- [ ] GDPR compliance verified (if applicable)
- [ ] Data retention policy defined

## Final Checks

- [ ] All tests passing
- [ ] No critical bugs in issue tracker
- [ ] Performance benchmarks met
- [ ] Team trained on support procedures
- [ ] Monitoring dashboards set up
- [ ] Rollback plan prepared

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor error rates daily
- [ ] Check user feedback
- [ ] Fix critical bugs immediately
- [ ] Monitor performance metrics

### Week 2-4
- [ ] Gather user feedback
- [ ] Plan first updates
- [ ] Review analytics
- [ ] Optimize based on usage patterns

### Ongoing
- [ ] Regular security updates
- [ ] Dependency updates
- [ ] Feature improvements
- [ ] User engagement initiatives

---

**Deployment Date**: __________

**Deployed By**: __________

**Production URL**: __________

**Notes**:
