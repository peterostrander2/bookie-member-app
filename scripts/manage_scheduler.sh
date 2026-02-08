#!/bin/bash
# Manage the daily health check scheduler
# Usage: ./scripts/manage_scheduler.sh [start|stop|status|run|logs]

PLIST="$HOME/Library/LaunchAgents/com.bookie-member-app.healthcheck.plist"
LABEL="com.bookie-member-app.healthcheck"

case "$1" in
    start)
        echo "Starting daily health check scheduler..."
        launchctl load "$PLIST" 2>/dev/null || echo "Already loaded"
        launchctl list | grep "$LABEL" && echo "Scheduler active - runs daily at 9:05 AM"
        ;;
    stop)
        echo "Stopping daily health check scheduler..."
        launchctl unload "$PLIST" 2>/dev/null || echo "Already stopped"
        echo "Scheduler disabled"
        ;;
    status)
        echo "Scheduler status:"
        if launchctl list | grep -q "$LABEL"; then
            launchctl list | grep "$LABEL"
            echo "Status: ACTIVE (runs daily at 9:05 AM)"
        else
            echo "Status: INACTIVE"
        fi
        ;;
    run)
        echo "Running health check now..."
        cd "$(dirname "$0")/.."
        ./scripts/daily_health_check.sh
        ;;
    logs)
        LOG_FILE="$HOME/bookie-member-app/logs/health_check.log"
        if [ -f "$LOG_FILE" ]; then
            echo "=== Last 50 lines of health check log ==="
            tail -50 "$LOG_FILE"
        else
            echo "No logs yet. Logs will appear after first scheduled run."
            echo "Run './scripts/manage_scheduler.sh run' to generate logs now."
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|status|run|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Enable daily health check (9:05 AM)"
        echo "  stop    - Disable daily health check"
        echo "  status  - Check if scheduler is active"
        echo "  run     - Run health check immediately"
        echo "  logs    - View recent health check logs"
        exit 1
        ;;
esac
