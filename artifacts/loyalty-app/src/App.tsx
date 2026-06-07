import { useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useGetAuthMe } from "@workspace/api-client-react";

import LandingPage from "@/pages/landing";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCustomers from "@/pages/admin/customers";
import AdminCustomerDetail from "@/pages/admin/customer-detail";
import AdminServices from "@/pages/admin/services";
import AdminPoints from "@/pages/admin/points";
import AdminReferrals from "@/pages/admin/referrals";
import AdminCommissions from "@/pages/admin/commissions";
import PortalHome from "@/pages/portal/home";
import PortalServices from "@/pages/portal/services";
import PortalPoints from "@/pages/portal/points";
import PortalReferrals from "@/pages/portal/referrals";
import PortalCommissions from "@/pages/portal/commissions";
import AdminLayout from "@/components/layout/admin-layout";
import PortalLayout from "@/components/layout/portal-layout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(45 93% 47%)",
    colorForeground: "hsl(210 40% 98%)",
    colorMutedForeground: "hsl(215 20.2% 65.1%)",
    colorDanger: "hsl(0 62.8% 30.6%)",
    colorBackground: "hsl(222 47% 11%)",
    colorInput: "hsl(217 33% 17%)",
    colorInputForeground: "hsl(210 40% 98%)",
    colorNeutral: "hsl(217 33% 17%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0F172A] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#1E293B]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-semibold text-2xl",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButtonText: "text-white font-medium",
    formFieldLabel: "text-gray-300 font-medium",
    footerActionLink: "text-[#FDE047] hover:text-[#FEF08A]",
    footerActionText: "text-gray-400",
    dividerText: "text-gray-500",
    identityPreviewEditButton: "text-[#FDE047] hover:text-[#FEF08A]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-red-400",
    logoBox: "mx-auto mb-4",
    logoImage: "w-16 h-16 object-contain",
    socialButtonsBlockButton: "border border-[#1E293B] bg-transparent hover:bg-[#1E293B] text-white",
    formButtonPrimary: "bg-gradient-to-r from-[#FDE047] to-[#D97706] text-[#0F172A] hover:opacity-90 font-bold",
    formFieldInput: "bg-[#1E293B] border-[#334155] text-white placeholder-gray-500",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#1E293B]",
    alert: "bg-red-950/50 border border-red-900",
    otpCodeFieldInput: "bg-[#1E293B] border-[#334155] text-white",
    formFieldRow: "mb-4",
    main: "mt-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress?.endsWith('@loyalpro.com');
  
  if (!isLoaded) return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;

  return (
    <>
      <Show when="signed-in">
        {isAdmin ? <Redirect to="/admin" /> : <Redirect to="/portal" />}
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function AdminRouteGuard({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress?.endsWith('@loyalpro.com');
  
  if (!isLoaded) return null;
  if (!isAdmin) return <Redirect to="/portal" />;
  
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function PortalRouteGuard({ component: Component }: { component: React.ComponentType }) {
  const { data: customer, isLoading, error } = useGetAuthMe({ query: { retry: false, queryKey: ["auth", "me"] } });
  
  if (isLoading) return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  if (error) return <div className="min-h-[100dvh] flex items-center justify-center bg-background text-white flex-col gap-4"><h2>Account not found</h2><p>Please contact support to link your account.</p></div>;

  return (
    <PortalLayout>
      <Component />
    </PortalLayout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to access your account" } },
        signUp: { start: { title: "Create your account", subtitle: "Get started today" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          
          <Route path="/admin">
            <Show when="signed-in"><AdminRouteGuard component={AdminDashboard} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/admin/customers">
            <Show when="signed-in"><AdminRouteGuard component={AdminCustomers} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/admin/customers/:id">
            <Show when="signed-in"><AdminRouteGuard component={AdminCustomerDetail} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/admin/services">
            <Show when="signed-in"><AdminRouteGuard component={AdminServices} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/admin/points">
            <Show when="signed-in"><AdminRouteGuard component={AdminPoints} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/admin/referrals">
            <Show when="signed-in"><AdminRouteGuard component={AdminReferrals} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/admin/commissions">
            <Show when="signed-in"><AdminRouteGuard component={AdminCommissions} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          
          <Route path="/portal">
            <Show when="signed-in"><PortalRouteGuard component={PortalHome} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/portal/services">
            <Show when="signed-in"><PortalRouteGuard component={PortalServices} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/portal/points">
            <Show when="signed-in"><PortalRouteGuard component={PortalPoints} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/portal/referrals">
            <Show when="signed-in"><PortalRouteGuard component={PortalReferrals} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>
          <Route path="/portal/commissions">
            <Show when="signed-in"><PortalRouteGuard component={PortalCommissions} /></Show>
            <Show when="signed-out"><Redirect to="/sign-in" /></Show>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
      <Toaster />
    </WouterRouter>
  );
}
