import { Ticket } from '../types';

const OFFLINE_QUEUE_KEY = 'bankmitra_offline_tickets_queue';
const LOCAL_TICKETS_CACHE_KEY = 'bankmitra_local_submitted_tickets';

export function getOfflineQueue(): Ticket[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline queue:', err);
    return [];
  }
}

export function saveOfflineTicket(ticket: Ticket): void {
  try {
    const queue = getOfflineQueue();
    // Prepend new ticket
    const updated = [ticket, ...queue.filter(t => t.id !== ticket.id)];
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
    
    // Also save to user local tickets cache for instant display in tracking tab
    saveLocalSubmittedTicket(ticket);
  } catch (err) {
    console.error('Error saving to offline queue:', err);
  }
}

export function removeOfflineTicket(id: string): void {
  try {
    const queue = getOfflineQueue();
    const filtered = queue.filter(t => t.id !== id);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error removing from offline queue:', err);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (err) {
    console.error('Error clearing offline queue:', err);
  }
}

export function getLocalSubmittedTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading local tickets cache:', err);
    return [];
  }
}

export function saveLocalSubmittedTicket(ticket: Ticket): void {
  try {
    const current = getLocalSubmittedTickets();
    const existingIndex = current.findIndex(t => t.id === ticket.id);
    let updated: Ticket[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...ticket };
    } else {
      updated = [ticket, ...current];
    }
    localStorage.setItem(LOCAL_TICKETS_CACHE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.error('Error saving to local submitted tickets:', err);
  }
}

export function updateLocalTicketStatus(id: string, updates: Partial<Ticket>): void {
  try {
    const current = getLocalSubmittedTickets();
    const updated = current.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    localStorage.setItem(LOCAL_TICKETS_CACHE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error updating local ticket status:', err);
  }
}
