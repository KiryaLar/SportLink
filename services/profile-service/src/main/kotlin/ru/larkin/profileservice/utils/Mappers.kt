package ru.larkin.profileservice.utils

import ru.larkin.profileservice.dto.resp.ProfileResponse
import ru.larkin.profileservice.dto.resp.ProfileSummaryResponse
import ru.larkin.profileservice.dto.resp.SportInfoResponse
import ru.larkin.profileservice.entity.Profile

typealias AvatarUrlBuilder = (String?) -> String?

fun Profile.toProfileSummaryResponse(avatarUrlBuilder: AvatarUrlBuilder) = ProfileSummaryResponse(
    id = id!!,
    name = name,
    city = city,
    avatarUrl = avatarUrlBuilder(avatarKey)
)

fun Profile.toProfileResponse(avatarUrlBuilder: AvatarUrlBuilder) = ProfileResponse(
    id = id!!,
    name = name,
    email = email,
    phone = phone,
    city = city,
    age = age,
    avatarUrl = avatarUrlBuilder(avatarKey),
    description = description,
    sports = sports.map { sport ->
        SportInfoResponse(
            id = sport.id!!,
            sport = sport.sport.name,
            level = sport.level,
            description = sport.description
        )
    },
    ratingAvg = rating.avg,
    ratingCount = rating.count
    )

//fun interface Mapper<in From, out To> {
//    fun map(from: From): To
//}
//
//object ProfileToSummaryResponseMapper : Mapper<Profile, ProfileSummaryResponse> {
//
//    override fun map(from: Profile) = ProfileSummaryResponse(
//        id = from.id,
//        name = from.name,
//        city = from.city,
//        avatarUrl = avatarBuilder.buildUrl(from.avatarKey)
//    )
//}