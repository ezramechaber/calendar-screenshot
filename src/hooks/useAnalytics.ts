import posthog from 'posthog-js'
import { Event } from '@/types'

type DeletionMethod = 'x_button' | 'dialog'
type SettingChangeType = 'background_theme' | 'drop_shadow' | 'todays_date'

export function useAnalytics() {
  const trackEventCreated = (event: Event) => {
    posthog.capture('event_created', {
      start_date: event.startDate,
      end_date: event.endDate
    })
  }

  const trackEventModified = (
    oldEvent: Event,
    newEvent: Event
  ) => {
    posthog.capture('event_modified', {
      start_date: newEvent.startDate,
      end_date: newEvent.endDate,
      is_name_change: oldEvent.title !== newEvent.title,
      is_multi_day_event: newEvent.startDate.toDateString() !== newEvent.endDate.toDateString(),
      color: oldEvent.color !== newEvent.color ? newEvent.color : undefined
    })
  }

  const trackEventDeleted = (
    event: Event,
    method: DeletionMethod
  ) => {
    posthog.capture('event_deleted', {
      deletion_method: method,
      is_multi_day: event.startDate.toDateString() !== event.endDate.toDateString()
    })
  }

  const trackSettingsChanged = (
    changeType: SettingChangeType,
    settings: {
      backgroundTheme?: string,
      isDropShadowVisible?: boolean,
      isTodaysDateVisible?: boolean
    }
  ) => {
    posthog.capture('settings_changed', {
      change_type: changeType,
      background_theme: settings.backgroundTheme,
      is_drop_shadow_visible: settings.isDropShadowVisible,
      is_todays_date_visible: settings.isTodaysDateVisible
    })
  }

  const trackCalendarAction = (
    action: 'copied' | 'downloaded',
    settings: {
      eventCount: number,
      backgroundTheme: string,
      isDropShadowVisible: boolean,
      isTodaysDateVisible: boolean
    }
  ) => {
    posthog.capture(`calendar_${action}`, {
      event_count: settings.eventCount,
      background_theme: settings.backgroundTheme,
      is_drop_shadow_visible: settings.isDropShadowVisible,
      is_todays_date_visible: settings.isTodaysDateVisible
    })
  }

  return {
    trackEventCreated,
    trackEventModified,
    trackEventDeleted,
    trackSettingsChanged,
    trackCalendarAction
  }
} 