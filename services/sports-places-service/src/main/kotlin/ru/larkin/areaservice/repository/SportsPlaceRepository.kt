package ru.larkin.areaservice.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import ru.larkin.areaservice.entity.SportsPlace
import ru.larkin.areaservice.entity.SportsPlaceStatus
import ru.larkin.areaservice.entity.SportsPlaceType

interface SportsPlaceRepository : JpaRepository<SportsPlace, Long> {

    fun findByStatus(status: SportsPlaceStatus): List<SportsPlace>

    fun findByPlaceType(placeType: SportsPlaceType): List<SportsPlace>

    @Query(
        """
        SELECT sp FROM SportsPlace sp
        WHERE (:status IS NULL OR sp.status = :status)
        AND (:placeType IS NULL OR sp.placeType = :placeType)
        AND (:sport IS NULL OR :sport MEMBER OF sp.supportedSports)
        AND (:latitude IS NULL OR :longitude IS NULL OR :radiusKm IS NULL
            OR (6371 * acos(
                cos(radians(:latitude)) * cos(radians(sp.latitude)) *
                cos(radians(sp.longitude) - radians(:longitude)) +
                sin(radians(:latitude)) * sin(radians(sp.latitude))
            )) <= :radiusKm)
        ORDER BY sp.name ASC
        """
    )
    fun searchSportsPlaces(
        @Param("sport") sport: String?,
        @Param("status") status: SportsPlaceStatus?,
        @Param("placeType") placeType: SportsPlaceType?,
        @Param("latitude") latitude: Double?,
        @Param("longitude") longitude: Double?,
        @Param("radiusKm") radiusKm: Double?
    ): List<SportsPlace>

    @Query(
        """
        SELECT sp FROM SportsPlace sp
        WHERE sp.status = 'ACTIVE'
        AND (:sport IS NULL OR :sport MEMBER OF sp.supportedSports)
        """
    )
    fun findActiveBySport(@Param("sport") sport: String?): List<SportsPlace>
}
