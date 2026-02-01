# ✅ GENI Servers Running

## Current Status (Jan 31, 2026 - 8:00 PM)

### Backend ✅
- **Status:** Running
- **Port:** 5000
- **URL:** http://localhost:5000
- **Health:** http://localhost:5000/health
- **API:** http://localhost:5000/api/status
- **Logs:** `/tmp/geni_backend_restart.log`

**Test:**
```bash
curl http://localhost:5000/api/status
```

---

### Frontend ✅
- **Status:** Running
- **Port:** 3000
- **URL:** http://localhost:3000
- **Logs:** `/tmp/geni_frontend_fresh.log`

**Open in browser:**
```
http://localhost:3000
```

---

## Quick Tests

### 1. Test Backend API
```bash
curl http://localhost:5000/api/status
```

### 2. Test Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello GENI"}'
```

### 3. Test Call Endpoint
```bash
curl -X POST http://localhost:5000/api/call/caregiver \
  -H "Content-Type: application/json" \
  -d '{"contactId":"Sarah Johnson","reason":"Test call"}'
```

### 4. Test Fall Detection
```bash
curl -X POST http://localhost:5000/api/fall/detected
```

---

## Features Ready to Test in Browser

Open: http://localhost:3000

**Test These:**
1. ✅ Chat with GENI
2. ✅ Voice input (click mic)
3. ✅ Check Pills (camera button)
4. ✅ Call buttons (Sarah Johnson, Dr. Smith)
5. ✅ Test Fall Detection button
6. ✅ Test Emergency Calls button
7. ✅ Dashboard real-time updates

---

## Stop Servers

```bash
# Stop backend
pkill -f "nodemon"

# Stop frontend
pkill -f "vite"

# Stop both
pkill -f "nodemon"; pkill -f "vite"
```

---

## Restart Servers

```bash
# Backend
cd /Users/yimi/Desktop/GENI/backend
npm run dev

# Frontend (new terminal)
cd /Users/yimi/Desktop/GENI/frontend
npm run dev
```

---

## View Logs

```bash
# Backend logs
tail -f /tmp/geni_backend_restart.log

# Frontend logs
tail -f /tmp/geni_frontend_fresh.log
```

---

**Both servers are running and ready!** 🚀

*Updated: Jan 31, 2026 8:00 PM*
