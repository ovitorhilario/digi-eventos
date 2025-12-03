import Header from "@/components/header";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast"
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { RouterContext } from "@/router";
import DigiEventosIc from '@/assets/digieventos-logo-ic.png';
import "../index.css";

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "DigiEventos",
			},
			{
				name: "description",
				content: "DigiEventos é a plataforma definitiva para gerenciar e promover seus eventos com facilidade e eficiência.",
			},
		],
		links: [
			{
				rel: "icon",
				href: DigiEventosIc,
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
				>
				<ToastProvider>
					<div className="grid grid-rows-[auto_1fr] h-svh">
						<Header />
						{isFetching ? <Loader /> : <Outlet />}
					</div>
				</ToastProvider>
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left  />
		</>
	);
}
