# Graph Report - .  (2026-07-04)

## Corpus Check
- Corpus is ~47,214 words - fits in a single context window. You may not need a graph.

## Summary
- 856 nodes · 1497 edges · 57 communities (48 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard Pages & Tables|Dashboard Pages & Tables]]
- [[_COMMUNITY_Auth & Onboarding Services|Auth & Onboarding Services]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Toast Notification System|Toast Notification System]]
- [[_COMMUNITY_Sidebar & Sheet UI|Sidebar & Sheet UI]]
- [[_COMMUNITY_Viral Content Reverse Engineering|Viral Content Reverse Engineering]]
- [[_COMMUNITY_Context Menu & Form Components|Context Menu & Form Components]]
- [[_COMMUNITY_App Layout & Header|App Layout & Header]]
- [[_COMMUNITY_Alert & Hover Card UI|Alert & Hover Card UI]]
- [[_COMMUNITY_SaaS Core Type System|SaaS Core Type System]]
- [[_COMMUNITY_API Router & User Store|API Router & User Store]]
- [[_COMMUNITY_Form Field Components|Form Field Components]]
- [[_COMMUNITY_Content Generation Service|Content Generation Service]]
- [[_COMMUNITY_Website Scraper Service|Website Scraper Service]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Prompt Cache Service|Prompt Cache Service]]
- [[_COMMUNITY_Industry Pack System|Industry Pack System]]
- [[_COMMUNITY_Component Registry (shadcnui)|Component Registry (shadcn/ui)]]
- [[_COMMUNITY_Telegram Bot Service|Telegram Bot Service]]
- [[_COMMUNITY_Tenant Service & DB|Tenant Service & DB]]
- [[_COMMUNITY_Button, Calendar & Pagination|Button, Calendar & Pagination]]
- [[_COMMUNITY_Carousel UI Component|Carousel UI Component]]
- [[_COMMUNITY_Item & List Components|Item & List Components]]
- [[_COMMUNITY_Menu Bar UI|Menu Bar UI]]
- [[_COMMUNITY_Chart Components|Chart Components]]
- [[_COMMUNITY_Input Group & Textarea|Input Group & Textarea]]
- [[_COMMUNITY_Database Adapter (Supabase)|Database Adapter (Supabase)]]
- [[_COMMUNITY_Package Configuration|Package Configuration]]
- [[_COMMUNITY_API Route Handler (Vercel)|API Route Handler (Vercel)]]
- [[_COMMUNITY_Alert Dialog UI|Alert Dialog UI]]
- [[_COMMUNITY_Database Schema|Database Schema]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Drawer UI|Drawer UI]]
- [[_COMMUNITY_Empty State UI|Empty State UI]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Button Group & Separator|Button Group & Separator]]
- [[_COMMUNITY_Toggle & Toggle Group|Toggle & Toggle Group]]
- [[_COMMUNITY_Vercel Deployment Config|Vercel Deployment Config]]
- [[_COMMUNITY_Dashboard Home UI|Dashboard Home UI]]
- [[_COMMUNITY_Content Review UI|Content Review UI]]
- [[_COMMUNITY_Onboarding Niche UI|Onboarding Niche UI]]
- [[_COMMUNITY_Onboarding Website UI|Onboarding Website UI]]
- [[_COMMUNITY_Login Page UI|Login Page UI]]
- [[_COMMUNITY_Notification Preferences UI|Notification Preferences UI]]
- [[_COMMUNITY_Platform Setup Wizard|Platform Setup Wizard]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 117 edges
2. `ContentReverseEngineer` - 25 edges
3. `WebsiteScraper` - 23 edges
4. `ContentService` - 20 edges
5. `PromptCache` - 20 edges
6. `PackService` - 16 edges
7. `compilerOptions` - 16 edges
8. `TelegramBot` - 15 edges
9. `Button` - 14 edges
10. `AuthService` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ensureInit()` --calls--> `initUserStore()`  [INFERRED]
  admin-dashboard-extracted/app/api/[[...route]]/route.ts → admin-dashboard-extracted/lib/saas-core/api/router.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  admin-dashboard-extracted/components/ui/alert-dialog.tsx → admin-dashboard-extracted/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  admin-dashboard-extracted/components/ui/alert-dialog.tsx → admin-dashboard-extracted/lib/utils.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  admin-dashboard-extracted/components/ui/breadcrumb.tsx → admin-dashboard-extracted/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  admin-dashboard-extracted/components/ui/breadcrumb.tsx → admin-dashboard-extracted/lib/utils.ts

## Import Cycles
- None detected.

## Communities (57 total, 9 thin omitted)

### Community 0 - "Dashboard Pages & Tables"
Cohesion: 0.05
Nodes (54): CreateUserDialog(), DashboardChart(), RecentTransactions(), transactions, transactions, UserTransactions(), users, Avatar (+46 more)

### Community 1 - "Auth & Onboarding Services"
Cohesion: 0.06
Nodes (24): AuthService, AuthSession, OnboardingState, WebsiteAnalysis, Notification, NotificationChannel, NotificationPreferences, NotificationService (+16 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.04
Nodes (52): dependencies, autoprefixer, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, hono (+44 more)

### Community 3 - "Toast Notification System"
Cohesion: 0.07
Nodes (37): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+29 more)

### Community 4 - "Sidebar & Sheet UI"
Cohesion: 0.05
Nodes (35): useIsMobile(), SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+27 more)

### Community 5 - "Viral Content Reverse Engineering"
Cohesion: 0.14
Nodes (15): AUDIO_TRENDS, ContentReverseEngineer, CTAS_BY_PLATFORM, HOOK_PATTERNS, STRUCTURE_PATTERNS, TIMING_PATTERNS, ExtractedPattern, HashtagCluster (+7 more)

### Community 6 - "Context Menu & Form Components"
Cohesion: 0.06
Nodes (25): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+17 more)

### Community 7 - "App Layout & Header"
Cohesion: 0.11
Nodes (19): inter, metadata, Header(), footerItems, navItems, SidebarContext, SidebarContextType, SidebarProvider() (+11 more)

### Community 8 - "Alert & Hover Card UI"
Cohesion: 0.07
Nodes (17): Alert, AlertDescription, AlertTitle, alertVariants, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator (+9 more)

### Community 9 - "SaaS Core Type System"
Cohesion: 0.11
Nodes (18): AiCostBreakdown, ApprovalEvent, ClientProduct, ContentRanking, ContentTypeMetrics, FunnelAnalytics, GrowthTrends, PaginationParams (+10 more)

### Community 10 - "API Router & User Store"
Cohesion: 0.09
Nodes (17): analyticsService, app, initUserStore(), loadUsersFromDB(), onboardingStore, packService, persistOnboarding(), persistUser() (+9 more)

### Community 11 - "Form Field Components"
Cohesion: 0.15
Nodes (18): cn(), Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend() (+10 more)

### Community 12 - "Content Generation Service"
Cohesion: 0.20
Nodes (8): ContentItem, ContentSEO, ContentStatus, GenerateContentRequest, GenerateContentResult, callDeepSeek(), ContentService, generateImages()

### Community 14 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 15 - "Prompt Cache Service"
Cohesion: 0.14
Nodes (4): PromptCache, INDUSTRY_SIGNALS, TONE_SIGNALS, WebsiteAnalysis

### Community 16 - "Industry Pack System"
Cohesion: 0.23
Nodes (8): ClientCharacter, ClientConfig, ClientHashtags, IndustryPack, PackGeneratorAnswers, PACK_CHARACTERS, PACK_HASHTAGS, PackService

### Community 17 - "Component Registry (shadcn/ui)"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 19 - "Tenant Service & DB"
Cohesion: 0.26
Nodes (5): dbUpdate(), SubscriptionTier, Tenant, initTenantStore(), TenantService

### Community 20 - "Button, Calendar & Pagination"
Cohesion: 0.16
Nodes (12): ButtonProps, buttonVariants, Calendar(), CalendarDayButton(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem (+4 more)

### Community 21 - "Carousel UI Component"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 22 - "Item & List Components"
Cohesion: 0.18
Nodes (12): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+4 more)

### Community 23 - "Menu Bar UI"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 24 - "Chart Components"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 25 - "Input Group & Textarea"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 26 - "Database Adapter (Supabase)"
Cohesion: 0.40
Nodes (9): dbCount(), dbDelete(), dbGet(), dbInsert(), dbQuery(), getBase(), getKey(), qs() (+1 more)

### Community 27 - "Package Configuration"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 28 - "API Route Handler (Vercel)"
Cohesion: 0.36
Nodes (7): app, DELETE(), ensureInit(), GET(), PATCH(), POST(), PUT()

### Community 29 - "Alert Dialog UI"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 30 - "Database Schema"
Cohesion: 0.25
Nodes (7): AnalyticsSnapshotRow, ApiUsageRow, ApprovalEventRow, ClientConfigRow, ContentItemRow, PlatformConnectionRow, TenantRow

### Community 31 - "Breadcrumb UI"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 32 - "Drawer UI"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 33 - "Empty State UI"
Cohesion: 0.29
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 34 - "Dev Dependencies"
Cohesion: 0.29
Nodes (7): devDependencies, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript

### Community 35 - "Button Group & Separator"
Cohesion: 0.38
Nodes (5): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Separator

### Community 36 - "Toggle & Toggle Group"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 37 - "Vercel Deployment Config"
Cohesion: 0.33
Nodes (5): buildCommand, framework, installCommand, outputDirectory, rewrites

### Community 38 - "Dashboard Home UI"
Cohesion: 0.33
Nodes (4): DEFAULT_PLATFORMS, PlatformCard, Props, styles

### Community 39 - "Content Review UI"
Cohesion: 0.40
Nodes (3): ContentDraft, Props, styles

### Community 40 - "Onboarding Niche UI"
Cohesion: 0.40
Nodes (3): Pack, Props, styles

### Community 41 - "Onboarding Website UI"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 42 - "Login Page UI"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **338 isolated node(s):** `users`, `users`, `app`, `inter`, `metadata` (+333 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TelegramBot` connect `Telegram Bot Service` to `Auth & Onboarding Services`?**
  _High betweenness centrality (0.326) - this node is a cross-community bridge._
- **Why does `data` connect `Telegram Bot Service` to `Dashboard Pages & Tables`?**
  _High betweenness centrality (0.320) - this node is a cross-community bridge._
- **Why does `cn()` connect `Form Field Components` to `Dashboard Pages & Tables`, `Toast Notification System`, `Sidebar & Sheet UI`, `Context Menu & Form Components`, `App Layout & Header`, `Alert & Hover Card UI`, `Button, Calendar & Pagination`, `Carousel UI Component`, `Item & List Components`, `Menu Bar UI`, `Chart Components`, `Input Group & Textarea`, `Alert Dialog UI`, `Breadcrumb UI`, `Drawer UI`, `Empty State UI`, `Button Group & Separator`, `Toggle & Toggle Group`, `Onboarding Website UI`, `Login Page UI`?**
  _High betweenness centrality (0.288) - this node is a cross-community bridge._
- **What connects `users`, `users`, `app` to the rest of the system?**
  _338 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard Pages & Tables` be split into smaller, more focused modules?**
  _Cohesion score 0.05450372920252438 - nodes in this community are weakly interconnected._
- **Should `Auth & Onboarding Services` be split into smaller, more focused modules?**
  _Cohesion score 0.06093189964157706 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.038461538461538464 - nodes in this community are weakly interconnected._