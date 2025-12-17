/**
 * Claude API Service
 *
 * Handles AI-powered guest response generation using Claude API.
 * Simulates realistic hotel guest conversations.
 */

import Anthropic from '@anthropic-ai/sdk';
import { Message } from '../types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

/**
 * Generate a guest response using Claude API
 */
export async function generateGuestResponse(
  guest: Guest,
  reservation: Reservation | undefined,
  conversationHistory: Message[]
): Promise<string> {
  try {
    // Build system prompt with guest context
    const systemPrompt = buildSystemPrompt(guest, reservation);

    // Convert conversation history to Claude format
    const claudeMessages = conversationHistory
      .slice(-10) // Only use last 10 messages for context
      .map((msg) => ({
        role: msg.sender === 'guest' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.8,
      system: systemPrompt,
      messages: claudeMessages.length > 0 ? claudeMessages : [
        { role: 'user', content: 'Hello' }
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');
    return textContent && textContent.type === 'text'
      ? textContent.text
      : "Thank you for your message. I'll get back to you shortly.";
  } catch (error) {
    console.error('Claude API error:', error);
    // Fallback response on error
    return "Thank you for your message. I'll get back to you shortly.";
  }
}

/**
 * Generate a staff response using Claude API
 */
export async function generateStaffResponse(
  guest: Guest,
  reservation: Reservation | undefined,
  conversationHistory: Message[]
): Promise<string> {
  try {
    // Build system prompt for staff
    const systemPrompt = buildStaffSystemPrompt(guest, reservation);

    // Convert conversation history to Claude format
    const claudeMessages = conversationHistory
      .slice(-10) // Only use last 10 messages for context
      .map((msg) => ({
        role: msg.sender === 'guest' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: claudeMessages.length > 0 ? claudeMessages : [
        { role: 'user', content: 'Hello' }
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');
    return textContent && textContent.type === 'text'
      ? textContent.text
      : "I'll help you with that right away!";
  } catch (error) {
    console.error('Claude API error (staff):', error);
    return "I'll help you with that right away!";
  }
}

/**
 * Build system prompt with guest context
 */
function buildSystemPrompt(guest: Guest, reservation: Reservation | undefined): string {
  const guestName = guest.name;
  const room = reservation?.room || 'a room';
  const checkIn = reservation?.checkInDate || 'recently';
  const checkOut = reservation?.checkOutDate || 'soon';
  const statusTag = guest.statusTag?.label || '';

  return `You are simulating a hotel guest named ${guestName} who is staying in room ${room}.

Guest Details:
- Name: ${guestName}
- Room: ${room}
- Check-in: ${checkIn}
- Check-out: ${checkOut}
${statusTag ? `- Status: ${statusTag}` : ''}

Important Instructions:
- Respond naturally as this guest would, based on their previous messages in the conversation
- Keep responses concise and conversational (1-3 sentences typically)
- Be polite and realistic - you're a real hotel guest texting with staff
- Match the tone and style of previous guest messages in this conversation
- If asking for something, be specific but reasonable
- If responding to hotel staff, be appreciative and clear
- Use casual texting language when appropriate (e.g., "Thanks!", "Great", "Sounds good")
- Don't repeat yourself - build on the conversation naturally
- Only respond as the guest - never as hotel staff or system

Current context: You're communicating with hotel staff via SMS. Stay in character as ${guestName}.`;
}

/**
 * Build system prompt for AI staff assistant
 */
function buildStaffSystemPrompt(guest: Guest, reservation: Reservation | undefined): string {
  const guestName = guest.name;
  const room = reservation?.room || 'a room';
  const statusTag = guest.statusTag?.label || '';

  return `You are Canary AI, an intelligent hotel staff assistant helping guests via SMS.

Guest Context:
- Name: ${guestName}
- Room: ${room}
${statusTag ? `- Status: ${statusTag}` : ''}

Your Role:
- You are a helpful, professional hotel staff member
- Respond to guest requests and questions efficiently
- Be warm, friendly, and solution-oriented
- Keep responses concise and clear (1-3 sentences typically)
- Use professional but conversational SMS language

Important Instructions:
- Always be helpful and proactive in solving guest issues
- If the guest needs something (towels, room service, etc.), acknowledge and confirm you'll handle it
- For questions about hotel amenities, provide accurate, helpful information
- If you don't have information, offer to find out or connect them with the right department
- Be empathetic to complaints or concerns
- Use casual, friendly language but maintain professionalism
- Sign off with your name occasionally: "- Canary AI" or just end naturally

Context: You're communicating with ${guestName} in room ${room} via SMS. Provide excellent service!`;
}
