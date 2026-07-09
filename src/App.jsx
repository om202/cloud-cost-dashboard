import { Cloud } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import DataQualityBanner from '@/components/DataQualityBanner'
import KpiSection from '@/components/KpiSection'
import TrendChart from '@/components/TrendChart'
import InsightSection from '@/components/InsightSection'
import CostTable from '@/components/CostTable'
import BudgetAlertForm from '@/components/BudgetAlertForm'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const NAV = [
  { href: '#overview', label: 'Overview' },
  { href: '#trends', label: 'Trends' },
  { href: '#breakdown', label: 'Breakdown' },
]

function App() {
  return (
    <SidebarProvider style={{ '--sidebar-width': '30rem' }}>
      <SidebarInset className="bg-muted/30">
        <header className="sticky top-0 z-30 border-b border-border bg-background">
          <div className="relative flex h-14 items-center gap-6 px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Cloud className="h-5 w-5" />
              </span>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Cloud Cost
              </span>
            </div>

            <NavigationMenu className="absolute left-1/2 hidden -translate-x-1/2 md:flex">
              <NavigationMenuList>
                {NAV.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <SidebarTrigger />
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
          <section id="overview" className="scroll-mt-20">
            <h1 className="text-2xl font-normal tracking-tight text-foreground">
              Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Spend vs. budget across accounts · Jan–Jun 2026
            </p>
          </section>

          <DataQualityBanner />

          <KpiSection />

          <div id="trends" className="scroll-mt-20">
            <TrendChart />
          </div>

          <div id="breakdown" className="scroll-mt-20">
            <CostTable />
          </div>

        </div>
      </SidebarInset>

      <Sidebar side="right" collapsible="offcanvas">
        <SidebarHeader className="border-b px-4">
          <h2 className="py-1 text-base font-medium text-sidebar-foreground">
            Insights &amp; Alerts
          </h2>
        </SidebarHeader>
        <SidebarContent className="gap-6 p-4">
          <div id="insight" className="scroll-mt-20">
            <InsightSection />
          </div>
          <div id="alerts" className="scroll-mt-20">
            <BudgetAlertForm />
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

export default App
