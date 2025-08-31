"use client"

import type { HotSpring } from "@/lib/hot-springs-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Thermometer, Star, DollarSign, Users, Calendar } from "lucide-react"

interface HotSpringCardProps {
  spring: HotSpring
  onClick: () => void
}

export function HotSpringCard({ spring, onClick }: HotSpringCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/95 backdrop-blur-sm border-violet-200/50 overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={spring.image || "/placeholder.svg"}
            alt={spring.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-violet-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          {spring.rating}
        </div>

        {/* State badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-violet-800 px-2 py-1 rounded-full text-xs font-medium">
          {spring.state}
        </div>

        {/* Temperature overlay */}
        <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          {Math.round((spring.temperature.min + spring.temperature.max) / 2)}°F
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 font-sans group-hover:text-violet-700 transition-colors">
              {spring.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {spring.city}, {spring.state}
            </div>
          </div>

          <p className="text-gray-700 text-sm line-clamp-2 font-serif leading-relaxed">{spring.description}</p>

          <div className="flex flex-wrap gap-1">
            {spring.features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-200"
              >
                {feature}
              </Badge>
            ))}
            {spring.features.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{spring.features.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {spring.accessibility.fee === "Paid" ? "Fee" : "Free"}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {spring.accessibility.difficulty}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {spring.accessibility.seasonal ? "Seasonal" : "Year-round"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
