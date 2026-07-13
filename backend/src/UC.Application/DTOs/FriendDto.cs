namespace UC.Application.DTOs;

public class FriendDto
{
    public Guid Id { get; set; }
    public Guid FriendProfileId { get; set; }
    public string FriendNickname { get; set; } = null!;
    public int FriendAvatarIndex { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? AcceptedAt { get; set; }
}