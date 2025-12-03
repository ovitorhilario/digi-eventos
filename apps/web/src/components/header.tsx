import { Link, useNavigate } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/context/auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetTrigger, SheetPopup, SheetHeader, SheetTitle } from "./ui/sheet";
import { MenuIcon, User, LogOut, Home, LayoutDashboard, X, Users } from "lucide-react";
import logo from "@/assets/digieventos-logo-ic.png";

export default function Header() {
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const links = [
		{ to: "/", label: "Eventos" },
		{ to: "/app/dashboard", label: "Dashboard" }
	] as const;

	const adminLinks = [
		{ to: "/app/usuarios", label: "Usuários", icon: Users }
	] as const;

	const handleLogout = async () => {
		await logout();
		navigate({ to: "/auth/sign-in" });
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo e Navegação */}
					<div className="flex items-center gap-6">
						<Link to="/" className="flex items-center gap-2 font-bold text-xl">
							<img
								src={logo}
								alt="DigiEventos Logo"
								className="w-8 h-8 object-contain"
							/>
							<span className="inline-block text-base sm:text-lg italic">DigiEventos</span>
						</Link>

						{/* Navegação Desktop */}
						<nav className="hidden md:flex items-center gap-6">
							{isAuthenticated && links.map(({ to, label }) => (
								<Link
									key={to}
									to={to}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
								>
									{label}
									<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
								</Link>
							))}
							{isAuthenticated && (user?.role === 'admin' || user?.role === 'owner') && adminLinks.map(({ to, label }) => (
								<Link
									key={to}
									to={to}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
								>
									{label}
									<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
								</Link>
							))}
						</nav>
					</div>

					{/* Ações do Usuário */}
					<div className="flex items-center gap-4">
						{isAuthenticated && user ? (
							<div className="flex items-center gap-4">
								{/* Navegação Mobile */}
								<nav className="hidden sm:flex md:hidden items-center gap-4">
									{links.map(({ to, label }) => (
										<Link
											key={to}
											to={to}
											className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
										>
											{label}
										</Link>
									))}
								</nav>

								{/* Menu Mobile */}
								<Sheet>
									<SheetTrigger>
										<Button variant="ghost" size="sm" className="p-2 sm:hidden">
											<MenuIcon className="h-5 w-5" />
											<span className="sr-only">Abrir menu</span>
										</Button>
									</SheetTrigger>
									<SheetPopup side="right" className="w-80">
										<SheetHeader>
											<SheetTitle className="flex items-center gap-2">
												<img
													src={logo}
													alt="DigiEventos Logo"
													className="size-10 object-contain"
												/>
												DigiEventos
											</SheetTitle>
										</SheetHeader>
										<div className="flex flex-col gap-2 px-4 pb-4">
											{/* Navegação */}
											<Button
												variant="ghost"
												className="justify-start gap-2"
												onClick={() => {
													navigate({ to: "/" });
												}}
											>
												<Home className="h-4 w-4" />
												Eventos
											</Button>
											<Button
												variant="ghost"
												className="justify-start gap-2"
												onClick={() => {
													navigate({ to: "/app/dashboard" });
												}}
											>
												<LayoutDashboard className="h-4 w-4" />
												Dashboard
											</Button>

											{/* Link de Usuários para Admin */}
											{(user?.role === 'admin' || user?.role === 'owner') && (
												<Button
													variant="ghost"
													className="justify-start gap-2"
													onClick={() => {
														navigate({ to: "/app/usuarios" });
													}}
												>
													<Users className="h-4 w-4" />
													Usuários
												</Button>
											)}

											{/* Perfil */}
											<Button
												variant="ghost"
												className="justify-start gap-2"
												onClick={() => {
													navigate({ to: "/app/perfil/$userId", params: { userId: user.id } });
												}}
											>
												<User className="h-4 w-4" />
												Perfil
											</Button>

											{/* Logout */}
											<Button
												variant="ghost"
												className="justify-start gap-2 text-destructive hover:text-destructive"
												onClick={handleLogout}
											>
												<LogOut className="h-4 w-4" />
												Sair
											</Button>
										</div>
									</SheetPopup>
								</Sheet>

								{/* Perfil do Usuário - Desktop */}
								<Link
									to="/app/perfil/$userId"
									params={{ userId: user.id }}
									className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"
								>
									<Avatar className="w-8 h-8">
										<AvatarImage 
											src={user.avatarUrl ?? undefined}
											alt={user.name}
										/>
										<AvatarFallback className="text-xs">
											{user.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className="hidden lg:inline-block text-sm font-medium">
										{user.name}
									</span>
								</Link>

								<Button
									onClick={handleLogout}
									variant="outline"
									size="sm"
									className="hidden sm:inline-flex"
								>
									Sair
								</Button>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Link to="/auth/sign-in">
									<Button size="sm">
										Entrar
									</Button>
								</Link>
							</div>
						)}

						<ModeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}
