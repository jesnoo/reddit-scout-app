"use client"

import { useState } from "react"
import { SearchPage } from "@/components/search-page"
import { ResultsPage } from "@/components/results-page"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"search" | "results">("search")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage("results")
  }

  const handleNewSearch = (query: string) => {
    setSearchQuery(query)
    // Stay on results page but trigger new search
  }

  const handleBackToSearch = () => {
    setCurrentPage("search")
    setSearchQuery("")
  }

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "search" ? (
        <SearchPage onSearch={handleSearch} />
      ) : (
        <ResultsPage query={searchQuery} onNewSearch={handleNewSearch} onBackToSearch={handleBackToSearch} />
      )}
    </main>
  )
}
