using AutoMapper;
using UC.Domain.Models;
using UC.Infrastructure.Database.Entities;

namespace UC.Application.Mapping;

public class PlayerProfileMappingProfile : Profile
{
    public PlayerProfileMappingProfile()
    {
        CreateMap<UpdatePlayerProfileDto, PlayerProfile>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        CreateMap<UpdatePlayerStatsDto, PlayerProfile>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
    }
}
