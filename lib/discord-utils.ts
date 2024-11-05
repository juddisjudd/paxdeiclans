export interface DiscordInviteInfo {
    isValid: boolean;
    memberCount?: number;
    presenceCount?: number;  // This is the online count
    guildName?: string;
    error?: string;
  }
  
  export async function getDiscordInviteInfo(inviteUrl: string): Promise<DiscordInviteInfo> {
    try {
      // Extract invite code from URL
      const inviteCode = inviteUrl.split('discord.gg/')[1];
      if (!inviteCode) {
        return { isValid: false, error: 'Invalid invite URL format' };
      }
  
      // Call Discord's API with with_counts=true to get both total and online counts
      const response = await fetch(
        `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) {
        return { 
          isValid: false, 
          error: response.status === 404 ? 'Invalid or expired invite' : 'Failed to verify invite'
        };
      }
  
      const data = await response.json();
      
      return {
        isValid: true,
        memberCount: data.approximate_member_count,
        presenceCount: data.approximate_presence_count, // This is the online count
        guildName: data.guild?.name
      };
    } catch (error) {
      console.error('Error checking Discord invite:', error);
      return { isValid: false, error: 'Failed to verify invite' };
    }
  }