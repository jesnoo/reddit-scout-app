"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchPageProps {
  onSearch: (query: string) => void
}

const popularSearches = [
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "SaaS",
  "Real Estate",
  "Food & Beverage",
  "Fitness",
  "Travel",
  "Gaming",
]

export function SearchPage({ onSearch }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSector, setSelectedSector] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchTerm.trim() || selectedSector
    if (query) {
      onSearch(query)
    }
  }

  const handlePopularSearch = (sector: string) => {
    setSearchTerm(sector)
    onSearch(sector)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* App Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Opportunity Finder</h1>
        <p className="text-lg text-muted-foreground max-w-md">Discover business opportunities from real pain points</p>
      </div>

      {/* Search Section */}
      <div className="w-full max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Input */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter sector (e.g., healthcare, finance...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 text-lg px-6 rounded-full border-2 focus:border-primary transition-colors"
              />
            </div>

            {/* Popular Searches Dropdown */}
            <div className="md:w-64">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="h-14 rounded-full border-2">
                  <SelectValue placeholder="Popular Searches" />
                </SelectTrigger>
                <SelectContent>
                  {popularSearches.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="h-14 px-12 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90"
              disabled={!searchTerm.trim() && !selectedSector}
            >
              Find Opportunities
            </Button>
          </div>
        </form>

        {/* Quick Access Popular Searches */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Or try these popular sectors:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.slice(0, 6).map((sector) => (
              <Button
                key={sector}
                variant="outline"
                size="sm"
                onClick={() => handlePopularSearch(sector)}
                className="rounded-full"
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center">
        <p className="text-xs text-muted-foreground">© 2024 Opportunity Finder. All rights reserved.</p>
      </footer>
    </div>
  )
}
