import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Starting seed...');

  try {
    // Create sample users
    console.log('Creating sample users...');
    const users = [
      { id: '00000000-0000-0000-0000-000000000001', display_name: 'Alice Johnson', points: 150 },
      { id: '00000000-0000-0000-0000-000000000002', display_name: 'Bob Smith', points: 120 },
      { id: '00000000-0000-0000-0000-000000000003', display_name: 'Charlie Brown', points: 90 },
      { id: '00000000-0000-0000-0000-000000000004', display_name: 'Diana Prince', points: 200 },
      { id: '00000000-0000-0000-0000-000000000005', display_name: 'Eve Davis', points: 80 }
    ];

    for (const user of users) {
      const { error } = await supabase.from('users').upsert(user);
      if (error) console.error(`Error creating user ${user.display_name}:`, error.message);
    }

    // Create sample hashtags
    console.log('Creating sample hashtags...');
    const hashtags = [
      'backpack',
      'laptop',
      'phone',
      'keys',
      'wallet',
      'notebook',
      'headphones',
      'waterbottle',
      'umbrella',
      'textbook'
    ];

    for (const tag of hashtags) {
      const { error } = await supabase.from('hashtags').upsert({ tag });
      if (error && !error.message.includes('duplicate'))
        console.error(`Error creating hashtag ${tag}:`, error.message);
    }

    // Create sample items
    console.log('Creating sample items...');
    const items = [
      {
        title: 'Blue Backpack Found in Library',
        description: 'Found a blue Jansport backpack on the 2nd floor of the main library. Contains some notebooks.',
        status: 'available',
        location_tag: 'Main Library, 2nd Floor',
        hashtags: ['backpack', 'blue'],
        posted_by: users[0].id,
        is_approved: true
      },
      {
        title: 'Silver MacBook Pro',
        description: '13-inch MacBook Pro found in the computer lab. Has some stickers on it.',
        status: 'available',
        location_tag: 'Computer Science Building, Lab 201',
        hashtags: ['laptop', 'macbook'],
        posted_by: users[1].id,
        is_approved: true
      },
      {
        title: 'Black iPhone 13',
        description: 'Found near the cafeteria entrance. Screen is cracked.',
        status: 'claimed',
        location_tag: 'Student Cafeteria',
        hashtags: ['phone', 'iphone'],
        posted_by: users[2].id,
        claimed_by: users[3].id,
        claimed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_approved: true
      },
      {
        title: 'Set of Keys with Paw Print Keychain',
        description: 'Found a set of keys with a cute paw print keychain attached.',
        status: 'available',
        location_tag: 'Student Union Building',
        hashtags: ['keys'],
        posted_by: users[3].id,
        is_approved: true
      },
      {
        title: 'Brown Leather Wallet',
        description: 'Found brown leather wallet near the gym. Contains some cards.',
        status: 'available',
        location_tag: 'Athletic Center',
        hashtags: ['wallet'],
        posted_by: users[4].id,
        is_approved: true
      }
    ];

    for (const item of items) {
      const { error } = await supabase.from('items').insert(item);
      if (error) console.error(`Error creating item ${item.title}:`, error.message);
    }

    // Award badges
    console.log('Awarding sample badges...');
    const badges = [
      { user_id: users[0].id, badge_type: 'finder_level_1' },
      { user_id: users[1].id, badge_type: 'first_post' },
      { user_id: users[3].id, badge_type: 'campus_hero' },
      { user_id: users[3].id, badge_type: 'finder_level_2' }
    ];

    for (const badge of badges) {
      const { error } = await supabase.from('badges').upsert(badge);
      if (error && !error.message.includes('duplicate'))
        console.error(`Error awarding badge:`, error.message);
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
