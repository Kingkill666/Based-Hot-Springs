"use client"

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Thermometer, Clock, Star, Search, Navigation, Droplets, Mountain, TreePine, Waves } from "lucide-react"
import { hotSpringsData, type HotSpring, countries } from "@/lib/hot-springs-data"

export default function BasedSprings() {
  useEffect(() => {
    if (typeof window !== "undefined" && sdk?.actions?.ready) {
      sdk.actions.ready();
    }
  }, []);
  // TODO: Call sdk.actions.ready() here when the Farcaster Mini Apps SDK is available

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedSpring, setSelectedSpring] = useState<HotSpring | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"name" | "rating" | "temperature">("rating")
  const springsPerPage = 12

  const filteredSprings = useMemo(() => {
    let filtered = hotSpringsData.filter((spring) => {
      const matchesSearch =
        spring.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spring.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spring.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spring.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spring.features.some((feature) => feature.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesState = selectedState === "all" || spring.state === selectedState
      const matchesCountry = selectedCountry === "all" || spring.country === selectedCountry

      return matchesSearch && matchesState && matchesCountry
    })

    // For the first 10 pages, only show US hot springs UNLESS a specific country is selected
    if (currentPage <= 10 && selectedCountry === "all") {
      filtered = filtered.filter((spring) => spring.country === "United States")
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rating":
          return b.rating - a.rating
        case "temperature":
          const avgA = a.temperature?.min && a.temperature?.max ? (a.temperature.min + a.temperature.max) / 2 : 0
          const avgB = b.temperature?.min && b.temperature?.max ? (b.temperature.min + b.temperature.max) / 2 : 0
          return avgB - avgA
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedState, selectedCountry, sortBy, currentPage])

  const totalPages = Math.ceil(filteredSprings.length / springsPerPage)
  const paginatedSprings = filteredSprings.slice((currentPage - 1) * springsPerPage, currentPage * springsPerPage)

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedState("all")
    setSelectedCountry("all")
    setCurrentPage(1)
  }

  // Derive unique sorted list of US states only from the data
  const states = useMemo(() => {
    const usStates = hotSpringsData
      .filter((spring) => spring.country === "United States")
      .map((spring) => spring.state)
    return Array.from(new Set(usStates)).sort()
  }, [])

  const stateStats = useMemo(() => {
    return states
      .map((state: string) => ({
        state,
        count: hotSpringsData.filter((spring) => spring.state === state && spring.country === "United States").length,
        avgRating: (
          hotSpringsData.filter((spring) => spring.state === state && spring.country === "United States").reduce((sum, spring) => sum + spring.rating, 0) /
          hotSpringsData.filter((spring) => spring.state === state && spring.country === "United States").length
        ).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
  }, [states])

  // Compute hot spring counts per country
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    countries.forEach((country) => {
      counts[country] = hotSpringsData.filter((spring) => spring.country === country).length;
    });
    return counts;
  }, [hotSpringsData]);

  return (
          <div
        className="min-h-screen relative"
        style={{
          backgroundImage: `url('/Mono_Hot_Springs_Background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Left side: Logo and Title */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Droplets className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-black">Based Springs</h1>
              </div>
              
              {/* Center: Subtitle */}
              <div className="flex-1 text-center">
                <p className="text-xl text-blue-600 font-medium">Complete US Hot Springs Database</p>
              </div>
              
              {/* Right side: Stats tabs */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-700 text-xl font-bold px-6 py-3 rounded-lg shadow-sm min-w-[140px] text-center">
                  {hotSpringsData.length} Springs
                </div>
                <div className="bg-white/80 text-black text-xl font-bold px-6 py-3 rounded-lg shadow-sm border border-gray-300 min-w-[140px] text-center">
                  {states.length} US States
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="bg-[#0052FF] text-white rounded-2xl px-8 py-6 inline-block shadow-2xl border-4 border-white max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
                Every Hot Spring in America
              </h2>
              <p className="text-xl max-w-4xl mx-auto drop-shadow-sm">
                The most comprehensive database of hot springs across America.
                detailed descriptions, temperatures, facilities, and everything you need for your next thermal adventure.
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-[#D1E8D1]/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200/50 max-w-5xl mx-auto mb-8 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search springs, cities, features..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 bg-white/90 text-black font-bold text-lg"
                  />
                </div>

                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-black font-bold text-lg"
                >
                  <option value="all">All US States ({states.length})</option>
                  {stateStats.map(({ state, count }: { state: string; count: number }) => (
                    <option key={state} value={state}>
                      {state} ({count})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-black font-bold text-lg"
                >
                  <option value="all">All Countries ({countries.length})</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country} ({countryCounts[country]})
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "rating" | "temperature")}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-black font-bold text-lg"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                  <option value="temperature">Sort by Temperature</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg text-black font-bold">
                  Showing {filteredSprings.length} of {hotSpringsData.length} hot springs
                  {(selectedState !== "all" || searchTerm) && (
                    <Button variant="link" onClick={resetFilters} className="ml-2 text-black font-bold p-0 h-auto text-lg">
                      Clear filters
                    </Button>
                  )}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/80 text-black font-bold text-lg"
                    >
                      Previous
                    </Button>
                    <span className="text-lg text-black font-bold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/80 text-black font-bold text-lg"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {/* Share on Farcaster Button */}
            <div className="flex justify-center mt-4">
              <a
                href="https://warpcast.com/~/compose?text=Check%20out%20Based%20Hot%20Springs%20Guide!%20https://based-hot-springs-8cqsqoqab-vmf-coin.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="lg" style={{ backgroundColor: '#8A63D2', color: 'white' }}>
                  Share on Farcaster
                </Button>
              </a>
            </div>
          </div>

          {/* Springs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedSprings.map((spring) => (
              <Card
                key={spring.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-blue-200/50 hover:border-blue-400/50 overflow-hidden bg-white/95 backdrop-blur-sm hover:scale-105"
                onClick={() => setSelectedSpring(spring)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={spring.image || "/placeholder.svg?height=300&width=400"}
                    alt={spring.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-blue-600/90 backdrop-blur-sm text-white text-xs shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {spring.rating}
                    </Badge>
                    {spring.clothingOptional && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100/90 backdrop-blur-sm text-orange-700 text-xs shadow-lg"
                      >
                        C/O
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs shadow-lg">
                      {spring.state}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-orange-500/90 backdrop-blur-sm text-white text-xs shadow-lg">
                      <Thermometer className="w-3 h-3 mr-1" />
                      {spring.temperature?.min && spring.temperature?.max
                        ? Math.round((spring.temperature.min + spring.temperature.max) / 2)
                        : "N/A"}
                      °F
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="font-serif text-lg leading-tight group-hover:text-blue-700 transition-colors">
                        {spring.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {spring.city}, {spring.state}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{spring.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Thermometer className="w-4 h-4" />
                      <span className="font-medium">
                        {spring.temperature?.min && spring.temperature?.max
                          ? Math.round((spring.temperature.min + spring.temperature.max) / 2)
                          : "N/A"}
                        °F
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Navigation className="w-4 h-4" />
                      <span className="font-medium">GPS Ready</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-xs">{spring.accessibility.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="font-medium text-xs">{spring.accessibility.fee !== "Free" ? "Fee" : "Free"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {spring.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {feature}
                      </Badge>
                    ))}
                    {spring.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{spring.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-white/90 backdrop-blur-sm"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-blue-600" : "bg-white/90 backdrop-blur-sm"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-white/90 backdrop-blur-sm"
              >
                Next
              </Button>
            </div>
          )}

          {/* Detailed View Modal */}
          {selectedSpring && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedSpring(null)}
            >
              <div
                className="bg-white/95 backdrop-blur-md rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedSpring.image ||"/placeholder.svg?height=400&width=800"}
                    alt={selectedSpring.name}
                    className="w-full h-64 md:h-80 object-cover rounded-t-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-t-xl" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                    onClick={() => setSelectedSpring(null)}
                  >
                    ✕
                  </Button>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Badge className="bg-blue-600/90 backdrop-blur-sm text-white shadow-lg">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {selectedSpring.rating}
                    </Badge>
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-lg">
                      {selectedSpring.state}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                        {selectedSpring.name}
                      </h3>
                      <p className="text-lg text-blue-600 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {selectedSpring.city}, {selectedSpring.state}
                      </p>
                      {selectedSpring.elevation && (
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Mountain className="w-4 h-4" />
                          {selectedSpring.elevation.toLocaleString()} ft elevation
                        </p>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-blue-50/80">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      {selectedSpring.detailedDescription ? (
                        <p className="text-gray-700 mb-6 text-lg leading-relaxed">{selectedSpring.detailedDescription}</p>
                      ) : (
                        <p className="text-gray-700 mb-6 text-lg leading-relaxed">{selectedSpring.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-orange-50/80 backdrop-blur-sm rounded-lg border border-orange-200/50">
                          <Thermometer className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Average Temp</p>
                          <p className="font-bold text-lg">
                            {selectedSpring.temperature?.min && selectedSpring.temperature?.max
                              ? Math.round((selectedSpring.temperature.min + selectedSpring.temperature.max) / 2)
                              : "N/A"}
                            °F
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Access</p>
                          <p className="font-semibold text-sm">{selectedSpring.accessibility.difficulty}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200/50">
                          <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Public Access</p>
                          <p className="font-semibold">N/A</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                          <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Entry Fee</p>
                          <p className="font-semibold">
                            {selectedSpring.accessibility.fee !== "Free" ? "Required" : "Free"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpring.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50/80 text-blue-700 backdrop-blur-sm"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedSpring.website && selectedSpring.website !== "N/A" && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-3 text-lg">Website</h4>
                          <Button
                            variant="outline"
                            className="bg-blue-50/80 text-blue-700 backdrop-blur-sm"
                            onClick={() => {
                              const url = selectedSpring.website.startsWith('http') 
                                ? selectedSpring.website 
                                : `https://${selectedSpring.website}`;
                              window.open(url, "_blank")
                            }}
                          >
                            Visit Website
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* Location Tab */}
                    <TabsContent value="location" className="mt-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">GPS Coordinates</h4>
                          <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
                            <p className="font-mono text-lg mb-2">
                              {selectedSpring.coordinates.lat}, {selectedSpring.coordinates.lng}
                            </p>
                            <p className="text-sm text-gray-600">
                              Decimal: {selectedSpring.coordinates.lat}, {selectedSpring.coordinates.lng}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-white/80 backdrop-blur-sm"
                              onClick={() => {
                                const url = `https://maps.google.com/?q=${selectedSpring.coordinates.lat},${selectedSpring.coordinates.lng}`
                                window.open(url, "_blank")
                              }}
                            >
                              <Navigation className="w-4 h-4 mr-2" />
                              Open in Maps
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 text-lg">Address & Location</h4>
                          <div className="space-y-2">
                            {selectedSpring.address ? (
                              <p className="font-medium">{selectedSpring.address}</p>
                            ) : (
                              <p className="font-medium">
                                {selectedSpring.city}, {selectedSpring.state}
                              </p>
                            )}
                            <p>Elevation: {selectedSpring.elevation?.toLocaleString()} ft</p>
                            {selectedSpring.location && (
                              <p className="text-gray-600 text-sm mt-2">{selectedSpring.location}</p>
                            )}
                          </div>
                        </div>

                        {selectedSpring.nearbyAttractions && (
                          <div>
                            <h4 className="font-semibold mb-3 text-lg">Nearby Attractions</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedSpring.nearbyAttractions.map((attraction, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-green-50/80 text-green-700 backdrop-blur-sm"
                                >
                                  {attraction}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedSpring.directions && (
                          <div>
                            <h4 className="font-semibold mb-3 text-lg">Directions</h4>
                            <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
                              <p className="text-gray-700">{selectedSpring.directions}</p>
                            </div>
                          </div>
                        )}

                        {selectedSpring.accessibilityDetails && (
                          <div>
                            <h4 className="font-semibold mb-3 text-lg">Accessibility Details</h4>
                            <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
                              <p className="text-gray-700">{selectedSpring.accessibilityDetails}</p>
                            </div>
                          </div>
                        )}

                        {selectedSpring.hotSpringDetails && (
                          <div>
                            <h4 className="font-semibold mb-3 text-lg">Hot Spring Details</h4>
                            <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg border border-blue-200/50">
                              <p className="text-gray-700">{selectedSpring.hotSpringDetails}</p>
                            </div>
                          </div>
                        )}

                        {selectedSpring.tips && (
                          <div>
                            <h4 className="font-semibold mb-3 text-lg">Visitor Tips</h4>
                            <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                              <p className="text-gray-700">{selectedSpring.tips}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-lg">Temperature Details</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg text-center border border-blue-200/50">
                              <p className="text-sm text-gray-600 mb-1">Minimum</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {selectedSpring.temperature?.min ?? "N/A"}°F
                              </p>
                            </div>
                            <div className="bg-orange-50/80 backdrop-blur-sm p-4 rounded-lg text-center border border-orange-200/50">
                              <p className="text-sm text-gray-600 mb-1">Average</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {selectedSpring.temperature?.min && selectedSpring.temperature?.max
                                  ? Math.round((selectedSpring.temperature.min + selectedSpring.temperature.max) / 2)
                                  : "N/A"}
                                °F
                              </p>
                            </div>
                            <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-lg text-center border border-red-200/50">
                              <p className="text-sm text-gray-600 mb-1">Maximum</p>
                              <p className="text-2xl font-bold text-red-600">
                                {selectedSpring.temperature?.max ?? "N/A"}°F
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedSpring.minerals && (
                          <div>
                            <h4 className="font-semibold mb-3 text-lg">Mineral Content</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedSpring.minerals.map((mineral, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-blue-50/80 text-blue-700 backdrop-blur-sm"
                                >
                                  {mineral}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-3 text-lg">Access Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Difficulty:</span>
                                <span className="font-medium">{selectedSpring.accessibility.difficulty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Seasonal Access:</span>
                                <span className="font-medium">
                                  {selectedSpring.accessibility.seasonal ? "Limited" : "Year-round"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Entry Fee:</span>
                                <span className="font-medium">{selectedSpring.accessibility.fee}</span>
                              </div>
                              {selectedSpring.clothingOptional && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Clothing Optional:</span>
                                  <span className="font-medium">Yes</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Facilities Tab */}
                    <TabsContent value="facilities" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Available Facilities</h4>
                          <div className="space-y-3">
                            {Object.entries(selectedSpring.facilities).map(([facility, available]) => (
                              <div key={facility} className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${available ? "border-green-500 bg-green-100" : "border-gray-300 bg-gray-100"}`}
                                />
                                <span className="text-gray-800 text-sm capitalize">{facility.replace(/([A-Z])/g, ' $1')}</span>
                                <span className={`ml-auto text-xs font-semibold ${available ? "text-green-600" : "text-gray-400"}`}>
                                  {available ? "Yes" : "No"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          {/* Based Springs Feature Section */}
          <section className="bg-[#0052FF] text-white py-5 mt-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Based Springs</h2>
                </div>
                <p className="text-sm max-w-3xl mx-auto leading-relaxed">
                  The most comprehensive database of hot springs in America. From remote wilderness pools to luxury resort spas, discover your perfect thermal escape with detailed GPS coordinates and insider information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Complete Coverage</h3>
                  <ul className="space-y-1 text-sm">
                    <li>All 50 states</li>
                    <li>International (coming soon)</li>
                    <li>{hotSpringsData.length}+ hot springs</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Detailed Information</h3>
                  <ul className="space-y-1 text-sm">
                    <li>GPS coordinates</li>
                    <li>Facilities</li>
                    <li>Access info</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Adventure Ready</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Planning guides</li>
                    <li>What to bring</li>
                    <li>Best times</li>
                  </ul>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Find your next thermal adventure with ease.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
