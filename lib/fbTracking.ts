declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

async function sendServerEvent(
  eventName: string,
  eventId: string,
  eventData?: Record<string, any>,
  userData?: Record<string, string>
): Promise<void> {
  try {
    await fetch('/api/fb-conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        user_data: {
          ...userData,
          fbc: getCookie('_fbc'),
          fbp: getCookie('_fbp'),
        },
        custom_data: eventData || {},
      }),
    });
  } catch (err) {
    console.error('FB CAPI error:', err);
  }
}

export function trackPageView(): void {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export function trackInitiateCheckout(value?: number, currency?: string): void {
  const eventId = generateEventId();
  const customData = {
    value: value || 10.0,
    currency: currency || 'USD',
    content_name: 'Base Plan - 3 Day Free Trial',
  };

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
  }

  sendServerEvent('InitiateCheckout', eventId, customData);
}

export function trackPurchase(value: number, currency: string, transactionId?: string): void {
  const eventId = generateEventId();
  const customData = {
    value,
    currency,
    content_name: 'Base Plan',
    ...(transactionId && { order_id: transactionId }),
  };

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', customData, { eventID: eventId });
  }

  sendServerEvent('Purchase', eventId, customData);
}
