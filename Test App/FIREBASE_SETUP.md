# Firebase Setup Guide for AcePrep 11+

## Overview

AcePrep 11+ uses Firebase for:
- **Authentication**: Google OAuth sign-in
- **Realtime Database**: Progress sync across devices
- **Cloud Storage**: User data persistence

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `aceprep-11-plus` (or your choice)
4. Enable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Google** sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add support email
   - Save

4. Add authorized domains:
   - Go to Authentication > Settings > Authorized domains
   - Add your GitHub Pages domain:
     - `mohsinh-lab.github.io`
     - `localhost` (for development)

## Step 3: Setup Realtime Database

1. Go to **Realtime Database** in Firebase Console
2. Click "Create Database"
3. Choose location: `europe-west1` (or closest to users)
4. Start in **Test mode** initially

5. **Configure Security Rules:**

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child($uid).child('linkedParents').child(auth.uid).exists()",
        ".write": "$uid === auth.uid",
        "linkedParents": {
          "$parentUid": {
            ".write": "$parentUid === auth.uid"
          }
        }
      }
    },
    "progress": {
      "$email": {
        ".read": "auth != null && (auth.token.email === $email || root.child('users').child(auth.uid).child('linkedStudents').child($email).exists())",
        ".write": "auth != null && auth.token.email === $email"
      }
    },
    "parentLinks": {
      "$studentUid": {
        ".read": "$studentUid === auth.uid || root.child('parentLinks').child($studentUid).child('parentUid').val() === auth.uid",
        ".write": "$studentUid === auth.uid || root.child('parentLinks').child($studentUid).child('parentUid').val() === auth.uid"
      }
    }
  }
}
```

**Rule Explanation:**
- **users/$uid**: User can read/write their own data; parents can read linked students
- **progress/$email**: User can read/write their progress; parents can read linked students' progress
- **parentLinks**: Manages parent-student relationships

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Register app with nickname: "AcePrep Web"
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click "New repository secret"
4. Add each Firebase config value:

| Secret Name | Value from Firebase Config |
|-------------|----------------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_DATABASE_URL` | `databaseURL` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

## Step 6: Local Development Setup

For local development, create `.env` file in `Test App/` directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**⚠️ Important:** Add `.env` to `.gitignore` to prevent committing secrets!

## Step 7: Test Firebase Connection

1. Start development server:
   ```bash
   cd "Test App"
   npm run dev
   ```

2. Open browser console (F12)
3. Look for Firebase initialization logs
4. Try signing in with Google
5. Check Firebase Console > Authentication > Users for new user

## Step 8: Verify Database Structure

After first user signs in and completes a quiz, check Firebase Console > Realtime Database:

```
aceprep-db/
├── users/
│   └── {uid}/
│       ├── email: "user@example.com"
│       ├── displayName: "User Name"
│       ├── role: "student" or "parent"
│       └── linkedStudents/ (for parents)
│           └── {studentEmail}: true
├── progress/
│   └── {email}/
│       ├── xp: 100
│       ├── sessions: [...]
│       ├── ratings: {...}
│       └── ...
└── parentLinks/
    └── {studentUid}/
        ├── parentUid: "parent-uid"
        └── approved: true
```

## Step 9: Setup Email Notifications (Optional)

For daily parent reports:

1. Create Gmail account or use existing
2. Enable 2-factor authentication
3. Generate App Password:
   - Go to Google Account > Security
   - 2-Step Verification > App passwords
   - Generate password for "Mail"
   - Copy 16-character password

4. Add to GitHub Secrets:
   - `MAIL_USERNAME`: Your Gmail address
   - `MAIL_PASSWORD`: App password (16 chars)
   - `PARENT_EMAIL`: Recipient email

## Troubleshooting

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution:**
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your deployment domain (e.g., `mohsinh-lab.github.io`)
- Add `localhost` for local development

### Issue: "Permission denied" when reading/writing data
**Solution:**
- Check Realtime Database rules
- Verify user is authenticated
- Check user has correct permissions
- Review rules match your data structure

### Issue: "Firebase not defined" error
**Solution:**
- Verify Firebase CDN imports in `firebase.js`
- Check network tab for failed CDN requests
- Ensure using correct Firebase version (10.9.0)

### Issue: Data not syncing across devices
**Solution:**
- Check both devices are using same email
- Verify Firebase connection in console
- Check `cloudSync.js` for errors
- Verify database rules allow read/write

### Issue: Build fails with Firebase env vars
**Solution:**
- Verify all secrets are added to GitHub
- Check secret names match exactly (case-sensitive)
- Ensure no extra spaces in secret values
- Re-run GitHub Actions workflow

## Security Best Practices

1. **Never commit Firebase config to git**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use strict database rules**
   - Require authentication
   - Limit read/write to user's own data
   - Validate data structure

3. **Monitor Firebase usage**
   - Set up billing alerts
   - Review usage in Firebase Console
   - Check for unusual activity

4. **Rotate credentials periodically**
   - Update API keys annually
   - Regenerate app passwords
   - Review authorized domains

## Firebase Quotas (Free Tier)

**Realtime Database:**
- 1 GB stored data
- 10 GB/month downloaded
- 100 simultaneous connections

**Authentication:**
- Unlimited users
- 3,000 email/password sign-ins per hour

**Hosting (if used):**
- 10 GB storage
- 360 MB/day transfer

**Monitor usage:** Firebase Console > Usage and billing

## Production Checklist

Before going live:
- ✅ Database rules configured and tested
- ✅ Authorized domains added
- ✅ All GitHub secrets configured
- ✅ Local development tested
- ✅ Authentication flow tested
- ✅ Data sync verified
- ✅ Email notifications tested (if enabled)
- ✅ Billing alerts set up
- ✅ Backup strategy defined

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Status](https://status.firebase.google.com/)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)

## Database Backup

**Manual Backup:**
1. Go to Realtime Database in Firebase Console
2. Click on three dots menu
3. Select "Export JSON"
4. Save file securely

**Automated Backup:**
Consider setting up automated backups using:
- Firebase Admin SDK
- Cloud Functions
- Scheduled exports to Cloud Storage

## Next Steps

After Firebase is configured:
1. Test authentication flow
2. Complete a quiz and verify data saves
3. Test on multiple devices
4. Verify parent-student linking
5. Test offline functionality
6. Deploy to production
7. Monitor for errors

Your Firebase setup is complete! 🎉
