# Voice Tutor - Monitoring & Logging Setup

## Overview

This document outlines the monitoring, logging, and analytics setup for the AI Voice Tutor feature in production.

---

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Voice Tutor Feature                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Event Logging                                   │  │
│  │  • Feature usage events                          │  │
│  │  • Error events                                  │  │
│  │  • Performance events                            │  │
│  └──────────────────────────────────────────────────┘  │
│                           ▼                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Metrics Collection                              │  │
│  │  • Performance metrics                           │  │
│  │  • Error metrics                                 │  │
│  │  • Usage metrics                                 │  │
│  └──────────────────────────────────────────────────┘  │
│                           ▼                             │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐        ┌──────────┐
   │ Logging │         │ Metrics │        │ Alerting │
   │ Service │         │ Service │        │ Service  │
   └─────────┘         └─────────┘        └──────────┘
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────────────────────────────────────────────┐
   │         Monitoring Dashboard                    │
   │  • Real-time metrics                            │
   │  • Historical trends                            │
   │  • Alerts                                       │
   │  • User feedback                                │
   └─────────────────────────────────────────────────┘
```

---

## Event Logging

### Feature Usage Events

```javascript
// When feature starts
logEvent('voice_tutor_started', {
  passage_id: 'passage_001',
  passage_length: 250,
  language: 'en',
  speed: 1,
  preset: 'normal',
  timestamp: Date.now(),
  user_id: getCurrentUserId(),
  browser: getBrowserInfo(),
  device: getDeviceInfo()
});

// When playback paused
logEvent('voice_tutor_paused', {
  passage_id: 'passage_001',
  duration: 45000,  // milliseconds
  word_index: 50,
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// When playback resumed
logEvent('voice_tutor_resumed', {
  passage_id: 'passage_001',
  pause_duration: 5000,  // milliseconds
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// When playback stopped
logEvent('voice_tutor_stopped', {
  passage_id: 'passage_001',
  duration: 120000,  // milliseconds
  completed: false,
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// When playback completed
logEvent('voice_tutor_completed', {
  passage_id: 'passage_001',
  duration: 120000,  // milliseconds
  speed: 1,
  preset: 'normal',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// When speed changed
logEvent('voice_tutor_speed_changed', {
  passage_id: 'passage_001',
  old_speed: 1,
  new_speed: 1.25,
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// When voice preset changed
logEvent('voice_tutor_preset_changed', {
  passage_id: 'passage_001',
  old_preset: 'normal',
  new_preset: 'optimusPrime',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// When language changed
logEvent('voice_tutor_language_changed', {
  passage_id: 'passage_001',
  old_language: 'en',
  new_language: 'ur',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});
```

### Error Events

```javascript
// Web Speech API not supported
logEvent('voice_tutor_error', {
  error_type: 'web_speech_api_not_supported',
  browser: getBrowserInfo(),
  device: getDeviceInfo(),
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Voice not available
logEvent('voice_tutor_error', {
  error_type: 'voice_not_available',
  language: 'ur',
  fallback_used: 'en',
  browser: getBrowserInfo(),
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Playback failed
logEvent('voice_tutor_error', {
  error_type: 'playback_failed',
  error_message: error.message,
  browser: getBrowserInfo(),
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Offline without cache
logEvent('voice_tutor_error', {
  error_type: 'offline_no_cache',
  passage_id: 'passage_001',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Cache error
logEvent('voice_tutor_error', {
  error_type: 'cache_error',
  error_message: error.message,
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});
```

### Performance Events

```javascript
// Initialization performance
logEvent('voice_tutor_performance', {
  metric: 'initialization_time',
  value: 45,  // milliseconds
  target: 500,
  status: 'pass',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Playback start performance
logEvent('voice_tutor_performance', {
  metric: 'playback_start_time',
  value: 8,  // milliseconds
  target: 200,
  status: 'pass',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Highlight latency
logEvent('voice_tutor_performance', {
  metric: 'highlight_latency',
  value: 3,  // milliseconds
  target: 50,
  status: 'pass',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});

// Memory usage
logEvent('voice_tutor_performance', {
  metric: 'memory_usage',
  value: 25,  // megabytes
  target: 50,
  status: 'pass',
  timestamp: Date.now(),
  user_id: getCurrentUserId()
});
```

---

## Metrics Collection

### Performance Metrics

```javascript
// Initialization time
metric('voice_tutor.init_time', initTime, {
  unit: 'milliseconds',
  target: 500,
  alert_threshold: 500
});

// Playback start time
metric('voice_tutor.playback_start_time', startTime, {
  unit: 'milliseconds',
  target: 200,
  alert_threshold: 200
});

// Highlight latency
metric('voice_tutor.highlight_latency', latency, {
  unit: 'milliseconds',
  target: 50,
  alert_threshold: 50
});

// Memory usage
metric('voice_tutor.memory_usage', memoryUsage, {
  unit: 'megabytes',
  target: 50,
  alert_threshold: 100
});

// Session duration
metric('voice_tutor.session_duration', duration, {
  unit: 'seconds',
  target: 30,
  alert_threshold: 10
});
```

### Error Metrics

```javascript
// Error rate
metric('voice_tutor.error_rate', errorCount / totalUsers, {
  unit: 'percentage',
  target: 0.1,
  alert_threshold: 0.5
});

// Error by type
metric('voice_tutor.error_by_type', {
  'web_speech_api_not_supported': count1,
  'voice_not_available': count2,
  'playback_failed': count3,
  'offline_no_cache': count4,
  'cache_error': count5
});

// Recovery rate
metric('voice_tutor.recovery_rate', recoveredCount / errorCount, {
  unit: 'percentage',
  target: 95,
  alert_threshold: 90
});

// Error by browser
metric('voice_tutor.error_by_browser', {
  'Chrome': count1,
  'Safari': count2,
  'Edge': count3,
  'Firefox': count4
});

// Error by device
metric('voice_tutor.error_by_device', {
  'iOS': count1,
  'Android': count2,
  'Desktop': count3
});
```

### Usage Metrics

```javascript
// Feature adoption
metric('voice_tutor.adoption_rate', activeUsers / totalUsers, {
  unit: 'percentage',
  target: 20,
  alert_threshold: 5
});

// Daily active users
metric('voice_tutor.daily_active_users', dau, {
  unit: 'count',
  target: 1000,
  alert_threshold: 100
});

// Average session duration
metric('voice_tutor.avg_session_duration', avgDuration, {
  unit: 'seconds',
  target: 60,
  alert_threshold: 10
});

// Speed preference distribution
metric('voice_tutor.speed_distribution', {
  '0.75x': percentage1,
  '1x': percentage2,
  '1.25x': percentage3,
  '1.5x': percentage4
});

// Preset preference distribution
metric('voice_tutor.preset_distribution', {
  'normal': percentage1,
  'optimusPrime': percentage2
});

// Language preference distribution
metric('voice_tutor.language_distribution', {
  'en': percentage1,
  'ur': percentage2
});
```

---

## Alerting Rules

### Critical Alerts

```
Alert: voice_tutor_critical_error
Condition: error_rate > 1% OR init_time > 500ms OR playback_start_time > 200ms
Severity: CRITICAL
Action: Page on-call engineer
Notification: Slack, Email, SMS
```

```
Alert: voice_tutor_data_loss
Condition: User preferences not persisting OR cache data lost
Severity: CRITICAL
Action: Page on-call engineer immediately
Notification: Slack, Email, SMS, Phone
```

```
Alert: voice_tutor_security_issue
Condition: Unauthorized access detected OR XSS vulnerability found
Severity: CRITICAL
Action: Page security team immediately
Notification: Slack, Email, SMS, Phone
```

### Major Alerts

```
Alert: voice_tutor_high_error_rate
Condition: error_rate > 0.5%
Severity: MAJOR
Action: Notify on-call engineer
Notification: Slack, Email
```

```
Alert: voice_tutor_performance_degradation
Condition: init_time > 300ms OR playback_start_time > 150ms
Severity: MAJOR
Action: Notify on-call engineer
Notification: Slack, Email
```

```
Alert: voice_tutor_low_adoption
Condition: adoption_rate < 5%
Severity: MAJOR
Action: Notify product team
Notification: Slack, Email
```

### Minor Alerts

```
Alert: voice_tutor_slow_performance
Condition: init_time > 200ms OR playback_start_time > 100ms
Severity: MINOR
Action: Log for review
Notification: Slack
```

```
Alert: voice_tutor_unusual_usage
Condition: Unusual usage pattern detected
Severity: MINOR
Action: Log for review
Notification: Slack
```

---

## Monitoring Dashboard

### Real-Time Metrics

```
┌─────────────────────────────────────────────────────┐
│  Voice Tutor - Real-Time Monitoring Dashboard       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Current Status: ✅ HEALTHY                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Performance Metrics                         │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Init Time:        45ms (target: 500ms) ✅   │   │
│  │ Playback Start:   8ms (target: 200ms) ✅    │   │
│  │ Highlight Latency: 3ms (target: 50ms) ✅   │   │
│  │ Memory Usage:     25MB (target: 50MB) ✅    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Error Metrics                               │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Error Rate:       0.05% (target: 0.1%) ✅   │   │
│  │ Recovery Rate:    98% (target: 95%) ✅      │   │
│  │ Total Errors:     12 (last 24h)             │   │
│  │ Critical Errors:  0                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Usage Metrics                               │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Daily Active Users: 2,450                   │   │
│  │ Adoption Rate:      24.5% (target: 20%) ✅  │   │
│  │ Avg Session:        65 seconds              │   │
│  │ Total Sessions:     8,920 (last 24h)        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Browser Compatibility                       │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Chrome:   ✅ Working (45% users)            │   │
│  │ Safari:   ✅ Working (30% users)            │   │
│  │ Edge:     ✅ Working (15% users)            │   │
│  │ Firefox:  ✅ Working (10% users)            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Historical Trends

```
┌─────────────────────────────────────────────────────┐
│  Voice Tutor - Historical Trends (Last 7 Days)     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Error Rate Trend                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ 0.1% │                                      │   │
│  │ 0.08%│    ╱╲                                │   │
│  │ 0.06%│   ╱  ╲      ╱╲                       │   │
│  │ 0.04%│  ╱    ╲    ╱  ╲    ╱╲                │   │
│  │ 0.02%│ ╱      ╲  ╱    ╲  ╱  ╲               │   │
│  │ 0%   │╱────────╲╱──────╲╱────╲              │   │
│  │      └─────────────────────────┘             │   │
│  │      Mon Tue Wed Thu Fri Sat Sun             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Adoption Rate Trend                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ 30% │                                  ╱╲   │   │
│  │ 25% │                            ╱╲   ╱  ╲  │   │
│  │ 20% │                      ╱╲   ╱  ╲ ╱    ╲ │   │
│  │ 15% │                ╱╲   ╱  ╲ ╱    ╲      │   │
│  │ 10% │          ╱╲   ╱  ╲ ╱                 │   │
│  │ 5%  │    ╱╲   ╱  ╲ ╱                       │   │
│  │ 0%  │   ╱  ╲ ╱                             │   │
│  │     └─────────────────────────────────────┘   │
│  │     Mon Tue Wed Thu Fri Sat Sun             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Logging Implementation

### Client-Side Logging

```javascript
/**
 * Log voice tutor event
 * @param {string} eventName - Event name
 * @param {Object} data - Event data
 */
function logVoiceTutorEvent(eventName, data) {
  const event = {
    timestamp: new Date().toISOString(),
    event: eventName,
    data: data,
    user_id: getCurrentUserId(),
    session_id: getSessionId(),
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    os: getOSInfo(),
    app_version: getAppVersion()
  };
  
  // Send to logging service
  fetch('/api/logs/voice-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    keepalive: true  // Ensure request completes even if page unloads
  }).catch(err => {
    // Fallback: Log to localStorage if network fails
    const logs = JSON.parse(localStorage.getItem('voice_tutor_logs') || '[]');
    logs.push(event);
    localStorage.setItem('voice_tutor_logs', JSON.stringify(logs.slice(-100)));
  });
}

/**
 * Log performance metric
 * @param {string} metricName - Metric name
 * @param {number} value - Metric value
 * @param {Object} tags - Optional tags
 */
function logPerformanceMetric(metricName, value, tags = {}) {
  const metric = {
    timestamp: new Date().toISOString(),
    metric: metricName,
    value: value,
    tags: tags,
    user_id: getCurrentUserId(),
    session_id: getSessionId()
  };
  
  // Send to metrics service
  fetch('/api/metrics/voice-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
    keepalive: true
  }).catch(err => {
    console.error('Failed to log metric:', err);
  });
}

/**
 * Log error
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
function logVoiceTutorError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error_type: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    context: context,
    user_id: getCurrentUserId(),
    session_id: getSessionId(),
    browser: getBrowserInfo(),
    device: getDeviceInfo()
  };
  
  // Send to error tracking service
  fetch('/api/errors/voice-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorLog),
    keepalive: true
  }).catch(err => {
    console.error('Failed to log error:', err);
  });
}
```

### Server-Side Logging

```javascript
// Express middleware for logging
app.post('/api/logs/voice-tutor', (req, res) => {
  const event = req.body;
  
  // Log to file
  logger.info('Voice Tutor Event', event);
  
  // Send to analytics service
  analytics.track(event.event, {
    user_id: event.user_id,
    session_id: event.session_id,
    ...event.data
  });
  
  // Store in database for analysis
  db.collection('voice_tutor_events').insertOne(event);
  
  res.json({ success: true });
});

// Metrics endpoint
app.post('/api/metrics/voice-tutor', (req, res) => {
  const metric = req.body;
  
  // Log to metrics service
  metrics.gauge(metric.metric, metric.value, {
    tags: metric.tags
  });
  
  // Store in time-series database
  timeseries.write(metric);
  
  res.json({ success: true });
});

// Error tracking endpoint
app.post('/api/errors/voice-tutor', (req, res) => {
  const errorLog = req.body;
  
  // Log to error tracking service
  errorTracker.captureException(errorLog);
  
  // Alert if critical
  if (errorLog.error_type === 'CRITICAL') {
    alerting.sendAlert('Voice Tutor Critical Error', errorLog);
  }
  
  res.json({ success: true });
});
```

---

## Dashboard Setup

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Voice Tutor Monitoring",
    "panels": [
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(voice_tutor_errors_total[5m])"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": { "params": [0.005], "type": "gt" },
              "operator": { "type": "and" },
              "query": { "params": ["A", "5m", "now"] },
              "reducer": { "params": [], "type": "avg" },
              "type": "query"
            }
          ]
        }
      },
      {
        "title": "Performance Metrics",
        "targets": [
          {
            "expr": "voice_tutor_init_time_ms"
          },
          {
            "expr": "voice_tutor_playback_start_ms"
          },
          {
            "expr": "voice_tutor_highlight_latency_ms"
          }
        ]
      },
      {
        "title": "Adoption Rate",
        "targets": [
          {
            "expr": "voice_tutor_active_users / total_users"
          }
        ]
      }
    ]
  }
}
```

### Datadog Dashboard

```python
# Create Datadog dashboard
dashboard = {
    "title": "Voice Tutor Monitoring",
    "widgets": [
        {
            "type": "timeseries",
            "title": "Error Rate",
            "queries": [
                {
                    "data_source": "metrics",
                    "name": "voice_tutor.error_rate"
                }
            ]
        },
        {
            "type": "gauge",
            "title": "Adoption Rate",
            "queries": [
                {
                    "data_source": "metrics",
                    "name": "voice_tutor.adoption_rate"
                }
            ]
        },
        {
            "type": "heatmap",
            "title": "Performance Distribution",
            "queries": [
                {
                    "data_source": "metrics",
                    "name": "voice_tutor.init_time"
                }
            ]
        }
    ]
}
```

---

## Alerting Configuration

### PagerDuty Integration

```
Service: Voice Tutor
Escalation Policy: On-Call Engineer
Notification Channels:
  - Slack: #voice-tutor-alerts
  - Email: oncall@aceprep.com
  - SMS: +1-XXX-XXX-XXXX
  - Phone: +1-XXX-XXX-XXXX

Alert Rules:
  - Error Rate > 1%: CRITICAL
  - Error Rate > 0.5%: MAJOR
  - Performance Degradation: MAJOR
  - Low Adoption: MINOR
```

### Slack Integration

```
Channel: #voice-tutor-alerts

Alert Format:
🚨 [CRITICAL] Voice Tutor Error Rate High
Error Rate: 1.2% (threshold: 1%)
Affected Users: 245
Duration: 5 minutes
Action: Page on-call engineer

Link: [View Dashboard]
```

---

## Retention Policies

### Event Logs

- Retention: 90 days
- Storage: Cloud storage (S3, GCS)
- Archival: After 30 days, move to cold storage

### Metrics

- Retention: 1 year
- Resolution: 1 minute (real-time), 1 hour (historical)
- Storage: Time-series database (InfluxDB, Prometheus)

### Error Logs

- Retention: 1 year
- Storage: Error tracking service (Sentry, Rollbar)
- Archival: After 90 days, move to cold storage

---

## Reporting

### Daily Report

```
Voice Tutor - Daily Report
Date: [DATE]

Summary:
- Error Rate: 0.05%
- Adoption Rate: 24.5%
- Daily Active Users: 2,450
- Average Session Duration: 65 seconds

Performance:
- Init Time: 45ms (target: 500ms) ✅
- Playback Start: 8ms (target: 200ms) ✅
- Highlight Latency: 3ms (target: 50ms) ✅

Errors:
- Total Errors: 12
- Critical Errors: 0
- Recovery Rate: 98%

Alerts:
- None

Recommendations:
- Continue monitoring
- No action needed
```

### Weekly Report

```
Voice Tutor - Weekly Report
Week: [WEEK]

Summary:
- Error Rate: 0.04% (↓ 20% from last week)
- Adoption Rate: 24.5% (↑ 5% from last week)
- Weekly Active Users: 8,920
- Average Session Duration: 65 seconds

Performance Trends:
- Init Time: Stable
- Playback Start: Stable
- Highlight Latency: Stable

Error Analysis:
- Most Common Error: voice_not_available (3 occurrences)
- Browser with Most Errors: Firefox (2 occurrences)
- Device with Most Errors: Desktop (5 occurrences)

Recommendations:
- Investigate Firefox compatibility
- Monitor voice availability
- Continue current monitoring
```

---

**Monitoring Setup Version**: 1.0
**Last Updated**: [Current Date]
**Status**: Ready for Production
**Recommendation**: IMPLEMENT BEFORE DEPLOYMENT

</content>
</invoke>