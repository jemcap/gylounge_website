import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client library
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
  });

  it('should export a public supabase client', async () => {
    const { supabaseClient } = await import('@/lib/supabase');
    expect(supabaseClient()).toBeDefined();
  });

  it('should create the public client with publishable key', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { supabaseClient } = await import('@/lib/supabase');

    supabaseClient();

    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-publishable-key'
    );
  });
});