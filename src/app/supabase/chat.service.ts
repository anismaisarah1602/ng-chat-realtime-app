import { Injectable, signal } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Ichat } from '../interface/chat-response';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private supabase!: SupabaseClient;
  public savedChat = signal({});

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Insert user into "users" table if not exists
  async upsertUser() {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Insert or update user
    const { error } = await this.supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata['full_name'] || user.email,
      avatar_url: user.user_metadata['avatar_url'] || ''
    });

    if (error) {
      console.error('Error upserting user:', error.message);
    }
  }

  async chatMessage(text: string) {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await this.supabase
        .from('chat')
        .insert({
          text: text,
          sender: user.id  
        });

      if (error) {
        alert(error.message);
      }
    } catch (error: any) {
      alert(error.message || error);
    }
  }

  async listChat() {
    try {
      const { data, error } = await this.supabase
        .from('chat')
        .select('*, users(*)');

      if (error) {
        alert(error.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteChat(id: string) {
    const data = await this.supabase.from('chat').delete().eq('id', id);
    return data;
  }

  selectedChats(msg: Ichat) {
    this.savedChat.set(msg);
  }
}
