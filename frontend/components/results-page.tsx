"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Heart, MessageCircle, TrendingUp } from "lucide-react"

interface ResultsPageProps {
  query: string
  onNewSearch: (query: string) => void
  onBackToSearch: () => void
}

interface Result {
  id: number
  problem: string
  solution: string
  tags: string[]
  metrics: {
    upvotes: number
    comments: number
    relevance: number
  }
}

const loadingStages = [
  "Scanning Reddit communities...",
  "Deep inside Reddit...",
  "Analyzing pain points...",
  "Formulating AI solutions...",
  "Preparing your opportunities...",
]

// Mock data for demonstration
const mockResults: Result[] = [
  {
    id: 1,
    problem: "Long wait times for specialist appointments",
    solution:
      "An AI-powered scheduling platform that dynamically allocates slots and matches patients with available doctors.",
    tags: ["B2B", "Healthcare", "Medium investment"],
    metrics: { upvotes: 156, comments: 23, relevance: 0.89 },
  },
  {
    id: 2,
    problem: "Difficulty tracking medication adherence for elderly patients",
    solution:
      "A smart pill dispenser with mobile app integration that sends reminders and tracks medication compliance.",
    tags: ["B2C", "Healthcare", "Hardware"],
    metrics: { upvotes: 89, comments: 15, relevance: 0.82 },
  },
  {
    id: 3,
    problem: "Medical records are scattered across different systems",
    solution:
      "A unified patient data platform that aggregates medical records from multiple providers with blockchain security.",
    tags: ["B2B", "Healthcare", "High investment"],
    metrics: { upvotes: 203, comments: 41, relevance: 0.91 },
  },
]

export function ResultsPage({ query, onNewSearch, onBackToSearch }: ResultsPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentStage, setCurrentStage] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [newSearchTerm, setNewSearchTerm] = useState("")

  useEffect(() => {
    // Simulate progressive loading
    setIsLoading(true)
    setCurrentStage(0)
    setResults([])

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < loadingStages.length - 1) {
          return prev + 1
        } else {
          clearInterval(stageInterval)
          setTimeout(() => {
            setIsLoading(false)
            setResults(mockResults)
          }, 1000)
          return prev
        }
      })
    }, 1500)

    return () => clearInterval(stageInterval)
  }, [query])

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSearchTerm.trim()) {
      onNewSearch(newSearchTerm.trim())
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBackToSearch} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex-1 max-w-md">
              <form onSubmit={handleNewSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Try another search..."
                  value={newSearchTerm}
                  onChange={(e) => setNewSearchTerm(e.target.value)}
                  className="rounded-full"
                />
                <Button type="submit" size="sm" className="rounded-full">
                  Search
                </Button>
              </form>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing results for: <span className="font-semibold text-foreground">{query}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <div className="text-2xl font-semibold text-foreground">{loadingStages[currentStage]}</div>
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Found {results.length} opportunities in {query}
              </h2>
              <p className="text-muted-foreground">Real pain points with AI-generated solutions</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-foreground leading-tight">{result.problem}</h3>
                      <p className="text-muted-foreground leading-relaxed">{result.solution}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {result.metrics.upvotes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {result.metrics.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {Math.round(result.metrics.relevance * 100)}%
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${result.problem}\n\n${result.solution}`)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
