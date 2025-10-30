"use client"

import { useEffect, useState, useMemo } from "react"
import { sdk } from "@farcaster/miniapp-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Thermometer, Clock, Star, Search, Navigation, Droplets, Mountain, TreePine, Waves, Wallet, Flame, Camera, MessageCirclePlus, Sparkles, ThumbsUp, MessageCircle, CornerUpRight, Cloud, Award, Flag, Trophy, Crown } from "lucide-react"
import { hotSpringsData, type HotSpring, countries } from "@/lib/hot-springs-data"
import { useFarcasterWallet } from "@/components/FarcasterWalletProvider"
import { toast } from "sonner"

export default function BasedSprings() {
  const { address, isConnected, isLoading, error, connect } = useFarcasterWallet();
  type HiddenGemNomination = {
    id: string;
    springId: string;
    pitch: string;
    votes: number;
    nominatedAt: number;
  };
  type SpringTipReply = {
    id: string;
    springId: string;
    tipId: string;
    author: string;
    message: string;
    createdAt: number;
  };
  type SpringTip = {
    id: string;
    springId: string;
    author: string;
    rating: number;
    message: string;
    mentions: string[];
    createdAt: number;
    helpful: number;
    replies: SpringTipReply[];
  };
  type QuestDefinition = {
    id: string;
    name: string;
    description: string;
    type: "check-in" | "tip";
    goal: number;
    badgeLabel: string;
    theme: "blue" | "green" | "orange";
    metadata?: {
      region?: "west" | "global";
      requiresMedia?: boolean;
    };
  };
  type QuestProgress = {
    questId: string;
    progress: number;
    completedAt?: number;
  };
  type QuestEvent =
    | { type: "check-in"; spring: HotSpring; withMedia: boolean }
    | { type: "tip"; spring: HotSpring; rating: number };
  type LeaderboardEntry = {
    id: string;
    name: string;
    points: number;
    badges: number;
    checkIns: number;
    tips: number;
  };

  const westernStateSet = new Set([
    "Alaska",
    "Arizona",
    "California",
    "Colorado",
    "Hawaii",
    "Idaho",
    "Montana",
    "Nevada",
    "New Mexico",
    "Oregon",
    "Utah",
    "Washington",
    "Wyoming",
  ])

  const questDefinitions: QuestDefinition[] = [
    {
      id: "quest-western-scout",
      name: "Western Soaker",
      description: "Log check-ins at 3 Western US springs.",
      type: "check-in",
      goal: 3,
      badgeLabel: "Western Scout",
      theme: "orange",
      metadata: { region: "west" },
    },
    {
      id: "quest-tip-trailblazer",
      name: "Tip Trailblazer",
      description: "Share 5 tips across the Based Springs map.",
      type: "tip",
      goal: 5,
      badgeLabel: "Tip Trailblazer",
      theme: "blue",
      metadata: { region: "global" },
    },
    {
      id: "quest-proof-collector",
      name: "Proof Collector",
      description: "Post 2 photo-backed check-ins.",
      type: "check-in",
      goal: 2,
      badgeLabel: "Proof Collector",
      theme: "green",
      metadata: { requiresMedia: true },
    },
  ]

  const questMatchesEvent = (quest: QuestDefinition, event: QuestEvent) => {
    if (quest.type !== event.type) return false
    if (quest.metadata?.region === "west" && !westernStateSet.has(event.spring.state)) return false
    if (quest.metadata?.requiresMedia && (event.type !== "check-in" || !event.withMedia)) return false
    return true
  }

  const questThemeStyles: Record<
    QuestDefinition["theme"],
    { bg: string; border: string; accent: string; progress: string }
  > = {
    blue: {
      bg: "bg-blue-50/80",
      border: "border-blue-200/60",
      accent: "text-blue-700",
      progress: "bg-blue-600",
    },
    green: {
      bg: "bg-green-50/80",
      border: "border-green-200/60",
      accent: "text-green-700",
      progress: "bg-green-600",
    },
    orange: {
      bg: "bg-orange-50/80",
      border: "border-orange-200/60",
      accent: "text-orange-700",
      progress: "bg-orange-500",
    },
  }

  // Debug wallet connection
  useEffect(() => {
    console.log('🔍 [BasedSprings] Wallet state:', {
      address,
      isConnected,
      isLoading,
      error,
      hasAddress: !!address,
      addressLength: address?.length
    });
  }, [address, isConnected, isLoading, error]);

  // Farcaster Mini App SDK: Remove splash screen when ready
  useEffect(() => {
    console.log("[BasedSprings] About to call sdk.actions.ready()");
    
    const initializeSDK = async () => {
      try {
        console.log('🔍 Checking Farcaster environment...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔧 SDK available:', !!sdk);
        console.log('🔧 SDK actions available:', !!sdk?.actions);
        console.log('🔧 SDK ready method available:', !!sdk?.actions?.ready);

        if (typeof window !== "undefined" && sdk?.actions?.ready) {
          console.log('🎯 Calling sdk.actions.ready()...');
          await sdk.actions.ready();
          console.log("✅ Farcaster Mini App SDK ready() called successfully");
        } else {
          console.warn("⚠️ sdk.actions.ready() unavailable - SDK:", !!sdk, "Actions:", !!sdk?.actions, "Ready:", !!sdk?.actions?.ready);
        }
      } catch (error) {
        console.error("❌ Failed to call sdk.actions.ready():", error);
      }
    };

    initializeSDK();
  }, []);



  const shareSpring = async (spring: HotSpring) => {
    try {
      setIsSharing(true);
      console.log('🎯 Share button clicked for:', spring.name);
      console.log('🔧 SDK available:', !!sdk);
      console.log('🔧 SDK actions available:', !!sdk?.actions);
      
      // Farcaster-specific share message
      const farcasterShareText = `♨️ Based Springs is the world's first Onchain Hot Spring Guide! Explore every U.S. spring + global gems, all verified onchain. Start your next soak today 👉 [https://farcaster.xyz/miniapps/vQEVAAn2F6bu/based] 🌍✨`;
      
      // Use Farcaster SDK composeCast method
      if (sdk?.actions?.composeCast) {
        console.log('🎯 Using Farcaster SDK composeCast...');
        console.log('📝 Share text:', farcasterShareText);
        console.log('🔗 Embed URL:', "https://farcaster.xyz/miniapps/vQEVAAn2F6bu/based");
        
        try {
          const result = await sdk.actions.composeCast({
            text: farcasterShareText,
            embeds: ["https://farcaster.xyz/miniapps/vQEVAAn2F6bu/based"]
          });
          
          console.log('📤 ComposeCast result:', result);
          
          if (result?.cast) {
            console.log('✅ Cast posted successfully:', result.cast.hash);
            toast.success(`Shared Based Springs on Farcaster!`);
          } else {
            console.log('ℹ️ User cancelled the cast');
            toast.info("Cast cancelled");
          }
        } catch (composeError) {
          console.error('❌ ComposeCast error:', composeError);
          throw composeError; // Re-throw to be caught by outer try-catch
        }
      } else if (navigator.share) {
        // Fallback to native share API
        console.log('📱 Using native share API...');
        await navigator.share({
          title: `Based Springs - Hot Spring Guide`,
          text: farcasterShareText,
          url: `https://farcaster.xyz/miniapps/vQEVAAn2F6bu/based`
        });
        console.log('✅ Native share successful');
        toast.success(`Shared Based Springs successfully!`);
      } else {
        // Final fallback: copy to clipboard
        console.log('📋 Using clipboard fallback...');
        await navigator.clipboard.writeText(farcasterShareText);
        toast.success("Farcaster share text copied to clipboard!");
        console.log('✅ Clipboard fallback successful');
      }
    } catch (error) {
      console.error("❌ Failed to share:", error);
      // Show user-friendly error message
      toast.error("Unable to share at this time. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedSpring, setSelectedSpring] = useState<HotSpring | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"name" | "rating" | "temperature">("rating")
  const [isSharing, setIsSharing] = useState(false)
  const [checkInCounts, setCheckInCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    hotSpringsData.forEach((spring) => {
      initial[spring.id] = 0
    })
    return initial
  })
  const [lastCheckInTimestamps, setLastCheckInTimestamps] = useState<Record<string, number>>({})
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [checkInMessage, setCheckInMessage] = useState("")
  const [checkInMediaUrl, setCheckInMediaUrl] = useState("")
  const [isPostingCheckIn, setIsPostingCheckIn] = useState(false)
  const [hiddenGemSelection, setHiddenGemSelection] = useState("")
  const [hiddenGemPitch, setHiddenGemPitch] = useState("")
  const [hiddenGemNominations, setHiddenGemNominations] = useState<HiddenGemNomination[]>([])
  const [hiddenGemVotesCast, setHiddenGemVotesCast] = useState<string[]>([])
  const [springTips, setSpringTips] = useState<SpringTip[]>([])
  const [tipMessage, setTipMessage] = useState("")
  const [tipRating, setTipRating] = useState(5)
  const [tipMentionsInput, setTipMentionsInput] = useState("")
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [helpfulVotesCast, setHelpfulVotesCast] = useState<string[]>([])
  const [questProgress, setQuestProgress] = useState<Record<string, QuestProgress>>(() => {
    const initial: Record<string, QuestProgress> = {}
    questDefinitions.forEach((quest) => {
      initial[quest.id] = {
        questId: quest.id,
        progress: 0,
      }
    })
    return initial
  })
  const [completedBadges, setCompletedBadges] = useState<string[]>([])
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([
    {
      id: "basedsprings",
      name: "BasedSprings",
      points: 28,
      badges: 4,
      checkIns: 12,
      tips: 6,
    },
    {
      id: "soakqueen",
      name: "SoakQueen",
      points: 22,
      badges: 3,
      checkIns: 9,
      tips: 5,
    },
    {
      id: "geo-god",
      name: "GeoGod",
      points: 18,
      badges: 2,
      checkIns: 7,
      tips: 4,
    },
  ])
  const [showHiddenGemModal, setShowHiddenGemModal] = useState(false)
  const [showQuestModal, setShowQuestModal] = useState(false)
  const springsPerPage = 12

  const getAverageTemperature = (spring: HotSpring | null) => {
    if (!spring?.temperature || spring.temperature.min == null || spring.temperature.max == null) {
      return null
    }
    return Math.round((spring.temperature.min + spring.temperature.max) / 2)
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`

    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  const buildCheckInTemplate = (spring: HotSpring) => {
    const avgTemp = getAverageTemperature(spring)
    const tempDescriptor = avgTemp ? `${avgTemp}°F steamy perfection` : "steamy perfection"
    return `Just dipped into ${spring.name} via @BasedSprings — temp: ${tempDescriptor}! 🌊 #HotSpringHunt`
  }

  useEffect(() => {
    if (selectedSpring) {
      setCheckInMessage(buildCheckInTemplate(selectedSpring))
      setCheckInMediaUrl("")
      setShowCheckInForm(false)
      setTipMessage("")
      setTipRating(5)
      setTipMentionsInput("")
      setReplyDrafts({})
    }
  }, [selectedSpring])

  const handleCheckInSubmit = async () => {
    if (!selectedSpring) return

    const now = Date.now()
    const lastCheckIn = lastCheckInTimestamps[selectedSpring.id]
    if (lastCheckIn && now - lastCheckIn < 1000 * 60 * 5) {
      toast.info("Easy there, hot spring hero! Try again in a few minutes.")
      return
    }

    const message = checkInMessage.trim() || buildCheckInTemplate(selectedSpring)
    const embeds: string[] = []
    const mediaLink = checkInMediaUrl.trim()
    if (mediaLink) {
      embeds.push(mediaLink)
    } else if (selectedSpring.image) {
      const fallbackImage = selectedSpring.image.startsWith("http")
        ? selectedSpring.image
        : typeof window !== "undefined"
          ? `${window.location.origin}${selectedSpring.image}`
          : selectedSpring.image
      embeds.push(fallbackImage)
    }

    setIsPostingCheckIn(true)

    try {
      if (sdk?.actions?.composeCast) {
        const result = await sdk.actions.composeCast({
          text: message,
          embeds: embeds.slice(0, 2),
        })

        if (!result?.cast) {
          toast.info("Check-in cancelled before posting.")
          return
        }
      } else if (navigator.share) {
        await navigator.share({
          title: "Based Springs Check-In",
          text: message,
          url: mediaLink || undefined,
        })
      } else {
        await navigator.clipboard.writeText(message)
        toast.info("Check-in message copied to clipboard.")
      }

      setCheckInCounts((prev) => ({
        ...prev,
        [selectedSpring.id]: (prev[selectedSpring.id] ?? 0) + 1,
      }))
      setLastCheckInTimestamps((prev) => ({
        ...prev,
        [selectedSpring.id]: now,
      }))
      recordQuestProgress({
        type: "check-in",
        spring: selectedSpring,
        withMedia: Boolean(mediaLink),
      })
      toast.success(`Logged your soak at ${selectedSpring.name}!`)
      setShowCheckInForm(false)
      setCheckInMediaUrl("")
    } catch (error) {
      console.error("❌ Failed to post check-in:", error)
      toast.error("Unable to post your check-in right now. Try again soon.")
    } finally {
      setIsPostingCheckIn(false)
    }
  }

  const findSpringById = (springId: string) =>
    hotSpringsData.find((spring) => spring.id === springId) ?? null

  const handleNominateHiddenGem = () => {
    if (!hiddenGemSelection) {
      toast.info("Choose a spring to spotlight first.")
      return
    }

    if (hiddenGemNominations.some((nomination) => nomination.springId === hiddenGemSelection)) {
      toast.info("That spring is already in the running—drop it a vote instead!")
      return
    }

    const trimmedPitch = hiddenGemPitch.trim()
    const newNomination: HiddenGemNomination = {
      id: `nom-${Date.now()}`,
      springId: hiddenGemSelection,
      pitch: trimmedPitch || "Underrated gem that deserves the spotlight.",
      votes: 1,
      nominatedAt: Date.now(),
    }

    setHiddenGemNominations((prev) => [...prev, newNomination])
    setHiddenGemVotesCast((prev) => [...prev, newNomination.id])
    setHiddenGemPitch("")
    setHiddenGemSelection("")
    toast.success("Nomination locked! Your vote has been counted.")
  }

  const handleVoteHiddenGem = (nominationId: string) => {
    if (hiddenGemVotesCast.includes(nominationId)) {
      toast.info("You've already backed this gem. Spread the word instead!")
      return
    }

    setHiddenGemNominations((prev) =>
      prev.map((nomination) =>
        nomination.id === nominationId
          ? { ...nomination, votes: nomination.votes + 1 }
          : nomination
      )
    )
    setHiddenGemVotesCast((prev) => [...prev, nominationId])
    toast.success("Vote counted! Thanks for hyping the springs.")
  }

  const sortedHiddenGemNominations = useMemo(() => {
    return [...hiddenGemNominations].sort((a, b) => {
      if (b.votes === a.votes) {
        return a.nominatedAt - b.nominatedAt
      }
      return b.votes - a.votes
    })
  }, [hiddenGemNominations])

  const featuredHiddenGem = sortedHiddenGemNominations[0] ?? null

  const shareHiddenGemWinner = async () => {
    if (!featuredHiddenGem) {
      toast.info("No hidden gem winner yet—get nominating!")
      return
    }

    const spotlightSpring = findSpringById(featuredHiddenGem.springId)
    if (!spotlightSpring) return

    const featureHighlight = spotlightSpring.features.length
      ? spotlightSpring.features.slice(0, 2).join(" & ")
      : "geothermal vibes"
    const message = `🌟 Hidden Gem Spotlight: ${spotlightSpring.name} in ${spotlightSpring.city}, ${spotlightSpring.state}! Voted by the @BasedSprings community for its ${featureHighlight}. Dive in and report back. #HiddenGem`

    try {
      if (sdk?.actions?.composeCast) {
        const result = await sdk.actions.composeCast({
          text: message,
          embeds: [
            spotlightSpring.image?.startsWith("http")
              ? spotlightSpring.image
              : typeof window !== "undefined"
                ? `${window.location.origin}${spotlightSpring.image}`
                : spotlightSpring.image,
          ].filter(Boolean) as string[],
        })

        if (!result?.cast) {
          toast.info("Spotlight cast cancelled.")
          return
        }
      } else if (navigator.share) {
        await navigator.share({
          title: "Hidden Gem Spotlight",
          text: message,
        })
      } else {
        await navigator.clipboard.writeText(message)
        toast.info("Spotlight message copied to clipboard. Paste it into your favorite client!")
      }
      toast.success("Spotlight shoutout ready to share!")
    } catch (error) {
      console.error("❌ Failed to share hidden gem:", error)
      toast.error("Couldn't launch the spotlight cast. Try again shortly.")
    }
  }

  const extractMentions = (value: string) => {
    const mentions = new Set<string>()
    const mentionRegex = /@([a-z0-9_]+)/gi
    let match: RegExpExecArray | null
    while ((match = mentionRegex.exec(value)) !== null) {
      mentions.add(match[1])
    }
    return Array.from(mentions)
  }

  const handleSubmitTip = () => {
    if (!selectedSpring) return

    const trimmedMessage = tipMessage.trim()
    if (!trimmedMessage) {
      toast.info("Drop a quick vibe check before posting.")
      return
    }

    const combinedForMentions = `${trimmedMessage} ${tipMentionsInput}`.trim()
    const mentions = extractMentions(combinedForMentions)
    const authorLabel = address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "Anon Soaker"

    const newTip: SpringTip = {
      id: `tip-${Date.now()}`,
      springId: selectedSpring.id,
      author: authorLabel,
      rating: tipRating,
      message: trimmedMessage,
      mentions,
      createdAt: Date.now(),
      helpful: 0,
      replies: [],
    }

    setSpringTips((prev) => [newTip, ...prev])
    setTipMessage("")
    setTipMentionsInput("")
    setTipRating(5)

    recordQuestProgress({
      type: "tip",
      spring: selectedSpring,
      rating: tipRating,
    })

    if (mentions.length > 0) {
      toast.success(`Tip posted! Mentioned: ${mentions.map((handle) => `@${handle}`).join(", ")}`)
    } else {
      toast.success("Tip posted! Thanks for sharing the vibes.")
    }
  }

  const handleMarkHelpful = (tipId: string) => {
    if (helpfulVotesCast.includes(tipId)) {
      toast.info("Already boosted this tip—share it with friends instead!")
      return
    }

    setSpringTips((prev) =>
      prev.map((tip) =>
        tip.id === tipId
          ? { ...tip, helpful: tip.helpful + 1 }
          : tip
      )
    )
    setHelpfulVotesCast((prev) => [...prev, tipId])
  }

  const handleReplySubmit = (tipId: string) => {
    const draft = replyDrafts[tipId]?.trim()
    if (!draft) {
      toast.info("Add a quick reply before sending.")
      return
    }

    const tip = springTips.find((item) => item.id === tipId)
    if (!tip) return

    const reply: SpringTipReply = {
      id: `reply-${Date.now()}`,
      springId: tip.springId,
      tipId,
      author: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Anon Soaker",
      message: draft,
      createdAt: Date.now(),
    }

    setSpringTips((prev) =>
      prev.map((item) =>
        item.id === tipId
          ? { ...item, replies: [...item.replies, reply] }
          : item
      )
    )
    setReplyDrafts((prev) => ({
      ...prev,
      [tipId]: "",
    }))
    toast.success("Reply added!")
  }

  const handleNotifyMentions = async (tip: SpringTip, spring: HotSpring) => {
    if (!tip.mentions.length) {
      toast.info("No mentions on this tip yet.")
      return
    }

    const mentionText = tip.mentions.map((mention) => `@${mention}`).join(" ")
    const message = `💬 New tip dropped for ${spring.name}: "${tip.message}" ${mentionText}`

    try {
      if (sdk?.actions?.composeCast) {
        const result = await sdk.actions.composeCast({
          text: message,
          embeds: [
            spring.image?.startsWith("http")
              ? spring.image
              : typeof window !== "undefined"
                ? `${window.location.origin}${spring.image}`
                : spring.image,
          ].filter(Boolean) as string[],
        })
        if (!result?.cast) {
          toast.info("Cast cancelled before sending.")
          return
        }
      } else if (navigator.share) {
        await navigator.share({
          title: `Tip for ${spring.name}`,
          text: message,
        })
      } else {
        await navigator.clipboard.writeText(message)
        toast.info("Notification message copied to clipboard.")
      }
      toast.success("Cast ready—let the crew know!")
    } catch (error) {
      console.error("❌ Failed to launch tip notification:", error)
      toast.error("Couldn't notify mentions right now. Try later.")
    }
  }

  const recordQuestProgress = (event: QuestEvent) => {
    const progressUpdates: { quest: QuestDefinition; progress: number }[] = []
    const newlyCompleted: QuestDefinition[] = []

    setQuestProgress((prev) => {
      const updated: Record<string, QuestProgress> = { ...prev }

      questDefinitions.forEach((quest) => {
        if (!questMatchesEvent(quest, event)) return

        const previousProgress = updated[quest.id]?.progress ?? 0
        if (previousProgress >= quest.goal) return

        const nextProgress = Math.min(quest.goal, previousProgress + 1)

        updated[quest.id] = {
          questId: quest.id,
          progress: nextProgress,
          completedAt: nextProgress === quest.goal ? Date.now() : updated[quest.id]?.completedAt,
        }

        progressUpdates.push({ quest, progress: nextProgress })

        if (nextProgress === quest.goal && !completedBadges.includes(quest.id)) {
          newlyCompleted.push(quest)
        }
      })

      return updated
    })

    if (progressUpdates.length > 0) {
      progressUpdates.forEach(({ quest, progress }) => {
        if (newlyCompleted.some((completedQuest) => completedQuest.id === quest.id)) {
          // completion toast handled below
          return
        }
        toast.info(`${quest.name}: ${progress}/${quest.goal}`)
      })
    }

    if (newlyCompleted.length > 0) {
      setCompletedBadges((prev) => [...prev, ...newlyCompleted.map((quest) => quest.id)])
      newlyCompleted.forEach((quest) => {
        toast.success(`Badge unlocked: ${quest.badgeLabel}!`)
      })
    }

    const userId = "you"
    const userName = address ? `You (${address.slice(0, 4)}...${address.slice(-4)})` : "You"
    const pointsEarned =
      event.type === "check-in"
        ? event.withMedia
          ? 4
          : 3
        : 2
    const bonusBadges = newlyCompleted.length

    setLeaderboardEntries((prev) => {
      const existing = prev.find((entry) => entry.id === userId)
      let updatedEntries: LeaderboardEntry[]

      if (existing) {
        updatedEntries = prev.map((entry) =>
          entry.id === userId
            ? {
                ...entry,
                name: userName,
                points: entry.points + pointsEarned + bonusBadges * 5,
                badges: entry.badges + bonusBadges,
                checkIns: entry.checkIns + (event.type === "check-in" ? 1 : 0),
                tips: entry.tips + (event.type === "tip" ? 1 : 0),
              }
            : entry
        )
      } else {
        updatedEntries = [
          ...prev,
          {
            id: userId,
            name: userName,
            points: pointsEarned + bonusBadges * 5,
            badges: bonusBadges,
            checkIns: event.type === "check-in" ? 1 : 0,
            tips: event.type === "tip" ? 1 : 0,
          },
        ]
      }

      return updatedEntries
        .map((entry) =>
          entry.badges < 0 ? { ...entry, badges: 0 } : entry
        )
        .sort((a, b) => b.points - a.points)
    })
  }

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

    // Only show US hot springs by default unless a specific country is selected
    if (selectedCountry === "all") {
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



  const resetFilters = () => {
    setSearchTerm("")
    setSelectedState("all")
    setSelectedCountry("all")
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredSprings.length / springsPerPage)
  const paginatedSprings = filteredSprings.slice((currentPage - 1) * springsPerPage, currentPage * springsPerPage)

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

  const hottestSoaks = useMemo(() => {
    return hotSpringsData
      .map((spring) => ({
        spring,
        checkIns: checkInCounts[spring.id] ?? 0,
      }))
      .filter((entry) => entry.checkIns > 0)
      .sort((a, b) => b.checkIns - a.checkIns)
      .slice(0, 6);
  }, [checkInCounts, hotSpringsData]);

  const totalRecordedCheckIns = useMemo(() => {
    return Object.values(checkInCounts).reduce((sum, value) => sum + value, 0)
  }, [checkInCounts])

  const sortedSpringsForNomination = useMemo(() => {
    return [...hotSpringsData].sort((a, b) => a.name.localeCompare(b.name))
  }, [hotSpringsData])

  const featuredHiddenGemSpring = featuredHiddenGem ? findSpringById(featuredHiddenGem.springId) : null
  const questsWithProgress = questDefinitions.map((quest) => {
    const progressEntry = questProgress[quest.id]
    const progress = progressEntry?.progress ?? 0
    const percentage = Math.min(100, Math.round((progress / quest.goal) * 100))
    const completed = progress >= quest.goal
    return {
      quest,
      progress,
      percentage,
      completed,
    }
  })
  const userTotalBadges = completedBadges.length
  const leaderboardTop = leaderboardEntries.slice(0, 5)
  const userLeaderboardEntry = leaderboardEntries.find((entry) => entry.id === "you") ?? null

  const renderHiddenGemModalContent = (
    options: { extraClassName?: string; ariaHidden?: boolean } = {}
  ) => {
    return (
      <section
        className={`bg-[#D1E8D1]/80 backdrop-blur-sm border border-green-200/60 rounded-2xl shadow-xl p-4 sm:p-6 mb-8 ${options.extraClassName ?? ""}`}
        aria-hidden={options.ariaHidden}
      >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Hidden Gem Spotlight</h3>
            <p className="text-xs sm:text-sm text-gray-700">
              Nominate under-the-radar springs and rally votes to feature them next week.
            </p>
            {featuredHiddenGemSpring && (
              <button
                className="mt-2 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-green-700 hover:text-green-800"
                onClick={() => {
                  setSelectedSpring(featuredHiddenGemSpring)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                Currently leading: {featuredHiddenGemSpring.name}
                <span className="text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {featuredHiddenGem.votes} vote{featuredHiddenGem.votes === 1 ? "" : "s"}
                </span>
              </button>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-white/80 text-green-700 border-green-300 hover:bg-green-200/60"
          onClick={shareHiddenGemWinner}
          disabled={!featuredHiddenGem}
        >
          {featuredHiddenGem ? "Cast Spotlight Shoutout" : "Awaiting First Winner"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-white/90 border border-green-200/60 rounded-2xl p-4 sm:p-5 shadow-inner">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Nominate a Hidden Gem</h4>
          <div className="space-y-3">
            <select
              value={hiddenGemSelection}
              onChange={(event) => setHiddenGemSelection(event.target.value)}
              className="w-full h-12 px-4 border border-green-200/60 rounded-xl bg-white/95 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">Pick a spring to spotlight...</option>
              {sortedSpringsForNomination.map((spring) => {
                const alreadyNominated = hiddenGemNominations.some((nomination) => nomination.springId === spring.id)
                return (
                  <option key={spring.id} value={spring.id} disabled={alreadyNominated}>
                    {spring.name} — {spring.city}, {spring.state}
                    {alreadyNominated ? " (already nominated)" : ""}
                  </option>
                )
              })}
            </select>

            <textarea
              value={hiddenGemPitch}
              onChange={(event) => setHiddenGemPitch(event.target.value)}
              placeholder="What makes this spot a hidden gem? (optional)"
              className="w-full min-h-[90px] rounded-xl border border-green-200/60 bg-white/95 p-3 text-sm text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Your nomination instantly receives one vote. Voting resets every Monday.
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                onClick={handleNominateHiddenGem}
                disabled={!hiddenGemSelection}
              >
                Submit Nomination
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/90 border border-green-200/60 rounded-2xl p-4 sm:p-5 shadow-inner">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Community Vote</h4>
          <div className="space-y-3">
            {sortedHiddenGemNominations.length === 0 && (
              <div className="border border-dashed border-green-300 rounded-xl p-4 text-center text-sm text-gray-600">
                No nominations yet—be the first to surface a secret soak!
              </div>
            )}
            {sortedHiddenGemNominations.map((nomination, index) => {
              const spring = findSpringById(nomination.springId)
              if (!spring) return null
              const userHasVoted = hiddenGemVotesCast.includes(nomination.id)
              const isLeading = featuredHiddenGem?.id === nomination.id

              return (
                <div
                  key={nomination.id}
                  className={`border rounded-xl p-4 transition-all duration-200 bg-white/90 ${
                    isLeading ? "border-green-400 shadow-lg" : "border-green-200/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border border-green-200">#{index + 1}</Badge>
                        <h5 className="text-base font-semibold text-gray-900">{spring.name}</h5>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {spring.city}, {spring.state}
                      </p>
                      <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{nomination.pitch}</p>
                    </div>
                    <Badge className="bg-green-500/90 text-white border border-green-600">
                      {nomination.votes} vote{nomination.votes === 1 ? "" : "s"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleVoteHiddenGem(nomination.id)}
                      disabled={userHasVoted}
                      className={`flex items-center gap-2 ${
                        userHasVoted ? "bg-gray-200 text-gray-500" : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {userHasVoted ? "Voted" : "Upvote"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 text-green-700 border-green-300 hover:bg-green-100"
                      onClick={() => {
                        setSelectedSpring(spring)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      View details
                    </Button>
                    {isLeading && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-3 py-1">
                        Leading contender
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </section>
    )
  }

  const renderQuestModalContent = (
    options: { extraClassName?: string; ariaHidden?: boolean } = {}
  ) => {
    return (
      <section
        className={`bg-white/90 backdrop-blur-sm border border-blue-200/60 rounded-2xl shadow-2xl p-4 sm:p-6 mb-10 ${options.extraClassName ?? ""}`}
        aria-hidden={options.ariaHidden}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Flag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Quest HQ</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Complete quests, mint badges, and climb the Ultimate Soakers leaderboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
              <Award className="w-4 h-4" />
              {userTotalBadges} badge{userTotalBadges === 1 ? "" : "s"} earned
            </div>
            {userLeaderboardEntry && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                <Crown className="w-4 h-4" />
                {userLeaderboardEntry.points} quest points
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {questsWithProgress.map(({ quest, progress, percentage, completed }) => {
              const theme = questThemeStyles[quest.theme]
              return (
                <div
                  key={quest.id}
                  className={`rounded-2xl border ${theme.border} ${theme.bg} p-4 sm:p-5 shadow-inner`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h4 className={`text-lg font-semibold ${theme.accent}`}>{quest.name}</h4>
                      <p className="text-sm text-gray-700 mt-1">{quest.description}</p>
                    </div>
                    <Badge className="bg-white/80 text-gray-800 border border-gray-200">
                      {quest.badgeLabel}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                      <div
                        className={`${theme.progress} h-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>{progress}/{quest.goal} completed</span>
                      {completed && <span className="text-green-600 font-semibold">Badge minted</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-[#0052FF] text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-blue-700/70">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <h4 className="text-lg font-semibold">Ultimate Soakers</h4>
            </div>
            <div className="space-y-3">
              {leaderboardTop.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 bg-white/10 rounded-xl px-3 py-3 ${
                    entry.id === "you" ? "ring-2 ring-yellow-300/70" : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{entry.name}</span>
                      <span>{entry.points} pts</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
                      <span>{entry.checkIns} check-ins</span>
                      <span>•</span>
                      <span>{entry.tips} tips</span>
                      {entry.badges > 0 && (
                        <>
                          <span>•</span>
                          <span>{entry.badges} badge{entry.badges === 1 ? "" : "s"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-white/10 rounded-xl p-3 text-xs text-white/80">
              <p>Complete quests to mint on-chain badges in the next release. Progress auto-syncs with Farcaster flair.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

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
        <header className="bg-[#D1E8D1]/90 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Logo and Title */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Droplets className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black tracking-tight">BASED SPRINGS</h1>
              </div>
              
              <div className="flex flex-col items-center gap-2 sm:gap-3 w-full sm:w-auto mt-14">
                {/* Stats tabs */}
                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                  <div className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-2 rounded-lg shadow-sm min-w-[94px] text-center">
                    {hotSpringsData.length} Springs
                  </div>
                  <div className="bg-white/80 text-black text-sm font-bold px-3 py-2 rounded-lg shadow-sm border border-gray-300 min-w-[94px] text-center">
                    {states.length} US States
                  </div>
                  <div className="bg-green-100 text-green-700 text-sm font-bold px-3 py-2 rounded-lg shadow-sm min-w-[94px] text-center">
                    {countries.length} Countries
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none bg-white text-green-700 border-green-300 hover:bg-green-100 min-w-[140px]"
                    onClick={() => setShowHiddenGemModal(true)}
                  >
                    Hidden Gem Spotlight
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none bg-white text-blue-700 border-blue-300 hover:bg-blue-100 min-w-[120px]"
                    onClick={() => setShowQuestModal(true)}
                  >
                    Quest HQ
                  </Button>
                </div>
              </div>
            </div>

            {/* Wallet Address Display - Simple red text like in the image */}
            <div className="flex justify-center mt-3">
              {isLoading && !error && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-mono text-sm">
                    🔍 Connecting wallet...
                  </span>
                  <button
                    onClick={connect}
                    className="text-blue-600 font-mono text-sm underline hover:text-blue-800"
                  >
                    Connect Now
                  </button>
                </div>
              )}
              {!isLoading && isConnected && address && (
                <span className="text-red-600 font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              )}
              {!isLoading && !isConnected && !error && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-mono text-sm">
                    ⚠️ Not signed in to Farcaster
                  </span>
                  <button
                    onClick={connect}
                    className="text-blue-600 font-mono text-sm underline hover:text-blue-800"
                  >
                    Sign in to Farcaster
                  </button>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-mono text-sm">
                    ❌ {error}
                  </span>
                  <button
                    onClick={connect}
                    className="text-blue-600 font-mono text-sm underline hover:text-blue-800"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="bg-[#0052FF] text-white rounded-2xl px-4 sm:px-8 py-4 sm:py-6 inline-block shadow-2xl border-4 border-white max-w-5xl mx-auto">
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
                Every Hot Spring In The World
              </h2>
              <p className="text-base sm:text-xl max-w-4xl mx-auto drop-shadow-sm">
                The most comprehensive onchain hot spring guide across the World.
                Detailed descriptions, temperatures, facilities, and everything you need for your next thermal adventure.
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-[#D1E8D1]/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl border border-blue-200/50 max-w-5xl mx-auto mb-6 sm:mb-8 mt-4 sm:mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search springs, cities, features..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full h-12 pl-10 bg-white/90 text-black font-bold text-lg rounded-lg border border-gray-300"
                  />
                </div>

                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full max-w-xs h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-black font-bold text-lg"
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
                  className="w-full max-w-xs h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-black font-bold text-lg"
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
                  className="w-full max-w-xs h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-black font-bold text-lg"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                  <option value="temperature">Sort by Temperature</option>
                </select>
              </div>


            </div>

            {/* Top Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(Math.max(1, currentPage - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
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
                        onClick={() => {
                          setCurrentPage(pageNum)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className={currentPage === pageNum ? "bg-blue-600" : "bg-white/90 backdrop-blur-sm"}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  Next
                </Button>
              </div>
            )}

          </div>

          {hottestSoaks.length > 0 && (
            <section className="bg-white/90 backdrop-blur-sm border border-orange-200/60 rounded-2xl shadow-xl p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Hottest Soaks Leaderboard</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Real-time check-ins from the Based Springs community.
                    </p>
                  </div>
                </div>
                <Badge className="bg-orange-500/90 text-white backdrop-blur-sm text-xs sm:text-sm px-3 py-1 shadow">
                  {totalRecordedCheckIns} total check-ins logged
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {hottestSoaks.map(({ spring, checkIns }, index) => {
                  const avgTemp = getAverageTemperature(spring)
                  return (
                    <div
                      key={spring.id}
                      className="group relative bg-gradient-to-br from-orange-50/80 to-white/90 border border-orange-200/60 rounded-2xl p-4 shadow transition-all duration-300 hover:shadow-2xl hover:border-orange-400/60 cursor-pointer"
                      onClick={() => {
                        setSelectedSpring(spring)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-black text-orange-500 drop-shadow-sm">{index + 1}</div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                              {spring.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {spring.city}, {spring.state}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-white/80 text-orange-600 border border-orange-300 text-xs shadow-sm">
                          {checkIns} check-in{checkIns === 1 ? "" : "s"}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-orange-500" />
                          {avgTemp ? `${avgTemp}°F avg` : "Temp varies"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {spring.rating.toFixed(1)} community rating
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-500" />
                          {spring.features.slice(0, 2).join(" • ")}
                          {spring.features.length > 2 && " +"}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 bg-white/90 backdrop-blur-sm text-orange-600 border-orange-300 hover:bg-orange-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedSpring(spring)
                        }}
                      >
                        View soak intel
                      </Button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {renderHiddenGemModalContent({ extraClassName: "hidden", ariaHidden: true })}


          {/* Springs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-5">
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
                    <Badge className={`${spring.rating === 5.0 ? 'bg-yellow-500/90' : 'bg-blue-600/90'} backdrop-blur-sm text-white text-xs shadow-lg`}>
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {spring.rating.toFixed(1)}
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

                  <div className="flex flex-wrap gap-1 mb-3">
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
                  
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSharing}
                      className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareSpring(spring);
                      }}
                    >
                      {isSharing ? "Sharing..." : "Share on Farcaster"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quest HQ */}
          {renderQuestModalContent({ extraClassName: "hidden", ariaHidden: true })}


          {/* Bottom Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-5">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(Math.max(1, currentPage - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
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
                      onClick={() => {
                        setCurrentPage(pageNum)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={currentPage === pageNum ? "bg-blue-600" : "bg-white/90 backdrop-blur-sm"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
              onClick={() => setSelectedSpring(null)}
            >
              <div
                className="bg-white/95 backdrop-blur-md rounded-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200/50"
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

                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                        {selectedSpring.name}
                      </h3>
                      <p className="text-base sm:text-lg text-blue-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        {selectedSpring.city}, {selectedSpring.state}
                      </p>
                      {selectedSpring.elevation && (
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Mountain className="w-3 h-3 sm:w-4 sm:h-4" />
                          {selectedSpring.elevation.toLocaleString()} ft elevation
                        </p>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-blue-50/80">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                      <TabsTrigger value="location" className="text-xs sm:text-sm">Location</TabsTrigger>
                      <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
                      <TabsTrigger value="community" className="text-xs sm:text-sm">Community</TabsTrigger>
                      <TabsTrigger value="facilities" className="text-xs sm:text-sm">Facilities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 sm:mt-6">
                      {selectedSpring.detailedDescription ? (
                        <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">{selectedSpring.detailedDescription}</p>
                      ) : (
                        <p className="text-gray-700 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">{selectedSpring.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="text-center p-3 sm:p-4 bg-orange-50/80 backdrop-blur-sm rounded-lg border border-orange-200/50">
                          <Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-600">Average Temp</p>
                          <p className="font-bold text-sm sm:text-lg">
                            {selectedSpring.temperature?.min && selectedSpring.temperature?.max
                              ? Math.round((selectedSpring.temperature.min + selectedSpring.temperature.max) / 2)
                              : "N/A"}
                            °F
                          </p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-600">Access</p>
                          <p className="font-semibold text-xs sm:text-sm">{selectedSpring.accessibility.difficulty}</p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200/50">
                          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-600">Public Access</p>
                          <p className="font-semibold text-xs sm:text-sm">N/A</p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
                          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-600">Entry Fee</p>
                          <p className="font-semibold text-xs sm:text-sm">
                            {selectedSpring.accessibility.fee !== "Free" ? "Required" : "Free"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-base sm:text-lg">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpring.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50/80 text-blue-700 backdrop-blur-sm text-xs sm:text-sm"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedSpring.website && selectedSpring.website !== "N/A" && (
                        <div className="mt-4 sm:mt-6">
                          <h4 className="font-semibold mb-3 text-base sm:text-lg">Website</h4>
                          <Button
                            variant="outline"
                            className="bg-blue-50/80 text-blue-700 backdrop-blur-sm text-sm sm:text-base"
                            onClick={() => {
                              if (selectedSpring.website) {
                              const url = selectedSpring.website.startsWith('http') 
                                ? selectedSpring.website 
                                : `https://${selectedSpring.website}`;
                              window.open(url, "_blank")
                              }
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

                    {/* Community Tab */}
                    <TabsContent value="community" className="mt-6">
                      {(() => {
                        const tipsForSpring = springTips.filter((tip) => tip.springId === selectedSpring.id)
                        const proHacks = [...tipsForSpring]
                          .sort((a, b) => {
                            if (b.helpful === a.helpful) {
                              return b.rating - a.rating
                            }
                            return b.helpful - a.helpful
                          })
                          .slice(0, 3)

                        return (
                          <div className="space-y-6">
                            {proHacks.length > 0 && (
                              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-4 sm:p-5">
                                <div className="flex items-center gap-2 mb-3">
                                  <Waves className="w-5 h-5 text-blue-600" />
                                  <h4 className="font-semibold text-lg text-gray-900">Pro Soaker Hacks</h4>
                                </div>
                                <div className="space-y-3">
                                  {proHacks.map((tip) => (
                                    <div key={tip.id} className="bg-white/90 border border-blue-200/60 rounded-xl p-3 text-sm text-gray-700 shadow-sm">
                                      <p className="italic">“{tip.message}”</p>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                        <span>{tip.author}</span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(tip.createdAt)}</span>
                                        <span>•</span>
                                        <span>{tip.rating} steam clouds</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="bg-white/95 border border-blue-200/60 rounded-2xl p-4 sm:p-6 shadow-inner">
                              <div className="flex items-center gap-2 mb-4">
                                <MessageCirclePlus className="w-5 h-5 text-blue-600" />
                                <h4 className="text-lg font-semibold text-gray-900">Share Your Vibe</h4>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Rating</span>
                                  <div className="flex items-center gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                      <button
                                        key={`steam-${value}`}
                                        type="button"
                                        onClick={() => setTipRating(value)}
                                        className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all ${
                                          value <= tipRating
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-blue-600 border-blue-200"
                                        }`}
                                      >
                                        <Cloud className="w-4 h-4" />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Tip</span>
                                  <textarea
                                    value={tipMessage}
                                    onChange={(event) => setTipMessage(event.target.value)}
                                    placeholder="Best soak time, what to bring, secret pool, etc."
                                    className="mt-2 w-full min-h-[120px] rounded-2xl border border-blue-200/60 bg-white/95 p-4 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  />
                                </div>

                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Mentions</span>
                                  <Input
                                    value={tipMentionsInput}
                                    onChange={(event) => setTipMentionsInput(event.target.value)}
                                    placeholder="@warpcast @basedsprings"
                                    className="mt-2 bg-white/95 text-sm"
                                  />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <p className="text-xs text-gray-500">
                                    Mention friends to ping them on Farcaster once you post.
                                  </p>
                                  <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                                    onClick={handleSubmitTip}
                                  >
                                    Post Tip
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                                <h4 className="text-lg font-semibold text-gray-900">Latest Tips & Threads</h4>
                              </div>

                              {tipsForSpring.length === 0 ? (
                                <div className="border border-dashed border-blue-200 rounded-2xl p-6 text-center text-sm text-gray-600">
                                  Be the first to drop knowledge about this soak spot.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {tipsForSpring.map((tip) => {
                                    const spring = findSpringById(tip.springId)
                                    if (!spring) return null
                                    const userMarkedHelpful = helpfulVotesCast.includes(tip.id)

                                    return (
                                      <div key={tip.id} className="border border-blue-200/60 rounded-2xl p-4 sm:p-5 bg-white/95 shadow-md">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                          <div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                  <Cloud
                                                    key={`${tip.id}-rating-${value}`}
                                                    className={`w-4 h-4 ${value <= tip.rating ? "text-blue-600" : "text-blue-200"}`}
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-xs font-medium text-gray-600">
                                                {tip.rating} / 5 steam clouds
                                              </span>
                                            </div>
                                            <p className="text-gray-800 text-sm sm:text-base leading-relaxed">{tip.message}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-600">
                                              <span className="font-medium text-blue-700">{tip.author}</span>
                                              <span>•</span>
                                              <span>{formatTimeAgo(tip.createdAt)}</span>
                                              {tip.mentions.length > 0 && (
                                                <>
                                                  <span>•</span>
                                                  <div className="flex flex-wrap gap-1">
                                                    {tip.mentions.map((mention) => (
                                                      <Badge key={mention} className="bg-blue-100 text-blue-700 border border-blue-200 text-[11px]">
                                                        @{mention}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                          <Badge className="bg-blue-600/90 text-white">
                                            {tip.helpful} helpful
                                          </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mt-4">
                                          <Button
                                            size="sm"
                                            className={`flex items-center gap-2 ${userMarkedHelpful ? "bg-gray-200 text-gray-500" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                                            onClick={() => handleMarkHelpful(tip.id)}
                                            disabled={userMarkedHelpful}
                                          >
                                            <ThumbsUp className="w-4 h-4" />
                                            {userMarkedHelpful ? "Marked helpful" : "Helpful"}
                                          </Button>
                                          {tip.mentions.length > 0 && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="bg-white/80 text-blue-700 border-blue-300 hover:bg-blue-100"
                                              onClick={() => handleNotifyMentions(tip, spring)}
                                            >
                                              Notify Mentions
                                            </Button>
                                          )}
                                        </div>

                                        <div className="mt-4 space-y-3">
                                          {tip.replies.map((reply) => (
                                            <div key={reply.id} className="flex gap-2 bg-blue-50/60 border border-blue-200/60 rounded-xl p-3">
                                              <CornerUpRight className="w-4 h-4 text-blue-500 mt-1" />
                                              <div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                  <span className="font-medium text-blue-700">{reply.author}</span>
                                                  <span>•</span>
                                                  <span>{formatTimeAgo(reply.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1">{reply.message}</p>
                                              </div>
                                            </div>
                                          ))}

                                          <div className="bg-white/70 border border-blue-200/60 rounded-xl p-3">
                                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                              Reply
                                            </label>
                                            <textarea
                                              value={replyDrafts[tip.id] ?? ""}
                                              onChange={(event) =>
                                                setReplyDrafts((prev) => ({
                                                  ...prev,
                                                  [tip.id]: event.target.value,
                                                }))
                                              }
                                              placeholder="Drop a follow-up question or hype them up."
                                              className="mt-2 w-full min-h-[80px] rounded-xl border border-blue-200 bg-white/95 p-3 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <div className="flex justify-end mt-2">
                                              <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => handleReplySubmit(tip.id)}
                                              >
                                                Reply
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}
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

                  {/* Check-In Block */}
                  <div className="p-4 sm:p-6 border-t border-gray-200/60 bg-blue-50/40">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">Soak Check-Ins</h4>
                          <p className="text-sm text-gray-600">
                            Claim your dip with a Farcaster cast and climb the Hottest Soaks leaderboard.
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 backdrop-blur-sm">
                          {(checkInCounts[selectedSpring.id] ?? 0).toLocaleString()} check-ins
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setShowCheckInForm((prev) => !prev)}
                        >
                          <MessageCirclePlus className="w-4 h-4 mr-2" />
                          I've Soaked Here!
                        </Button>
                        {lastCheckInTimestamps[selectedSpring.id] && (
                          <span className="text-xs sm:text-sm text-gray-600 bg-white/60 rounded-full px-3 py-1">
                            Last check-in: {new Date(lastCheckInTimestamps[selectedSpring.id]).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {showCheckInForm && (
                        <div className="w-full bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-4 sm:p-5 space-y-3">
                          <div>
                            <label htmlFor="check-in-message" className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                              Cast Copy
                            </label>
                            <textarea
                              id="check-in-message"
                              value={checkInMessage}
                              onChange={(event) => setCheckInMessage(event.target.value)}
                              className="mt-1 w-full min-h-[100px] rounded-xl border border-blue-200/60 bg-white/90 p-3 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          </div>

                          <div>
                            <label htmlFor="check-in-media" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                              <Camera className="w-4 h-4 text-gray-500" />
                              Add proof (optional link)
                            </label>
                            <Input
                              id="check-in-media"
                              placeholder="https://your-photo-or-video-url"
                              value={checkInMediaUrl}
                              onChange={(event) => setCheckInMediaUrl(event.target.value)}
                              className="mt-1 w-full bg-white/90 text-sm"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-gray-500">
                              Tip: tag friends and drop your best soak photo to inspire the crew.
                            </p>
                            <Button
                              onClick={handleCheckInSubmit}
                              disabled={isPostingCheckIn}
                              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                            >
                              {isPostingCheckIn ? "Posting..." : "Cast Check-In"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Share Button */}
                  <div className="p-4 sm:p-6 border-t border-gray-200/50">
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        disabled={isSharing}
                        className="bg-blue-100 text-blue-800 backdrop-blur-sm hover:bg-blue-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border-blue-300"
                        onClick={() => shareSpring(selectedSpring)}
                      >
                        {isSharing ? "Sharing..." : `Share Based Springs on Farcaster`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showHiddenGemModal && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-[100]"
              onClick={() => setShowHiddenGemModal(false)}
            >
              <div
                className="relative max-w-6xl w-full max-h-[92vh] overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg z-10"
                  onClick={() => setShowHiddenGemModal(false)}
                >
                  ✕
                </Button>
                {renderHiddenGemModalContent({ extraClassName: "mb-0" })}
              </div>
            </div>
          )}

          {showQuestModal && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-[100]"
              onClick={() => setShowQuestModal(false)}
            >
              <div
                className="relative max-w-6xl w-full max-h-[92vh] overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg z-10"
                  onClick={() => setShowQuestModal(false)}
                >
                  ✕
                </Button>
                {renderQuestModalContent({ extraClassName: "mb-0" })}
              </div>
            </div>
          )}

          {/* Based Springs Feature Section */}
          <section className="bg-[#0052FF] text-white py-4 sm:py-5 mt-12 sm:mt-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold">Based Springs</h2>
                </div>
                <p className="text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed">
                  The most comprehensive onchain database of the world's hot springs. From remote wilderness pools to luxury resort spas, discover your perfect thermal escape with detailed GPS coordinates and insider information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold mb-2">Complete Coverage</h3>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    <li>All 50 states</li>
                    <li>International (coming soon)</li>
                    <li>{hotSpringsData.length}+ hot springs</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold mb-2">Detailed Information</h3>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    <li>GPS coordinates</li>
                    <li>Facilities</li>
                    <li>Access info</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold mb-2">Adventure Ready</h3>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    <li>Planning guides</li>
                    <li>What to bring</li>
                    <li>Best times</li>
                  </ul>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs sm:text-sm">
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
