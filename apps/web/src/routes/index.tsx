import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useGetEvents } from "@/http/gen";
import { useAuth } from "@/context/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, CalendarDays, MapPin } from "lucide-react";
import { useUserRegistrations } from "@/lib/use-user-registrations";
import { useState } from "react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Search, Filter } from "lucide-react";
import digiEventosLogo from "@/assets/digieventos-logo-ic.png";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const { isAuthenticated } = useAuth();
	const { data: events, isLoading: eventsLoading, error: eventsError } = useGetEvents({
		query: {
			enabled: isAuthenticated, 
		}
	});
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const { isUserRegistered } = useUserRegistrations();

	// Só processa eventos se o usuário estiver autenticado
	const categories = isAuthenticated ? Array.from(new Set(events?.flatMap(event => event.categories.map(cat => cat.title)) || [])) : [];

	const filteredEvents = isAuthenticated ? events?.filter(event => 
		(selectedCategories.length === 0 || event.categories.some(cat => selectedCategories.includes(cat.title))) &&
		(searchTerm === "" || 
			event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
			(event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())))
	) : [];

	const renderCategoryValue = (value: string[]) => {
		if (value.length === 0) {
			return "Filtrar por categoria…";
		}
		const firstCategory = value[0];
		const additionalCategories = value.length > 1 ? ` (+${value.length - 1} mais)` : "";
		return firstCategory + additionalCategories;
	};

	// Se não estiver autenticado, mostra tela de login
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen">
				<div className="container mx-auto max-w-6xl px-4 py-12">
					{/* Hero Section */}
					<div className="text-center mb-16">
						<div className="relative inline-block">
							<div className="absolute inset-0 bg-linear-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl transform scale-150"></div>
							<img 
								src={digiEventosLogo} 
								alt="DigiEventos Logo" 
								className="relative h-32 md:h-40 w-auto object-contain mx-auto drop-shadow-2xl"
							/>
						</div>
						<div className="mt-8 space-y-4">
							<h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-600 via-purple-700 to-indigo-700 dark:from-purple-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
								Eventos Disponíveis
							</h1>
							<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
								Descubra e participe dos melhores eventos da sua região. 
								Encontre experiências únicas e conecte-se com pessoas incríveis.
							</p>
						</div>
					</div>

					{/* Login Required Section */}
					<div className="text-center">
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-white/20 dark:border-gray-700/50 max-w-md mx-auto">
							<div className="mb-6">
								<div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
									<Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
								</div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
									Acesso Restrito
								</h2>
								<p className="text-gray-600 dark:text-gray-300">
									Faça login para visualizar e participar dos eventos disponíveis.
								</p>
							</div>
							<Link to="/auth/sign-in">
								<Button size="lg" className="w-full">
									Fazer Login
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (eventsLoading) {
		return (
			<div className="min-h-screen">
				<div className="container mx-auto max-w-6xl px-4 py-12">
					<p className="text-center">Carregando eventos...</p>
				</div>
			</div>
		);
	}

	if (eventsError) {
		return (
			<div className="min-h-screen">
				<div className="container mx-auto max-w-6xl px-4 py-12">
					<p className="text-center">Erro ao carregar eventos: {eventsError.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-6xl px-4 py-12">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<div className="relative inline-block">
						<div className="absolute inset-0 bg-linear-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl transform scale-150"></div>
						<img 
							src={digiEventosLogo} 
							alt="DigiEventos Logo" 
							className="relative h-32 md:h-40 w-auto object-contain mx-auto drop-shadow-2xl"
						/>
					</div>
					<div className="mt-8 space-y-4">
						<h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-600 via-purple-700 to-indigo-700 dark:from-purple-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
							Eventos Disponíveis
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
							Descubra e participe dos melhores eventos da sua região. 
							Encontre experiências únicas e conecte-se com pessoas incríveis.
						</p>
					</div>
				</div>

				{/* Filters Section */}
				<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/50 mb-12">
					<div className="flex flex-col lg:flex-row gap-6 items-center">
						<div className="flex-1 w-full lg:max-w-md">
							<div className="relative">
								<Search className="z-10 absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
								<Input
									placeholder="Buscar por título ou descrição..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 h-12 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200 bg-white dark:bg-gray-700"
								/>
							</div>
						</div>
						<div className="w-full lg:w-auto lg:min-w-[280px]">
							<Select multiple value={selectedCategories} onValueChange={setSelectedCategories}>
								<SelectTrigger className="h-12 px-4 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200 bg-white dark:bg-gray-700">
									<SelectValue>
										<div className="flex items-center gap-2">
											<Filter className="h-4 w-4 text-gray-500 mr-1.5" />
											<span>{renderCategoryValue(selectedCategories)}</span>
										</div>
									</SelectValue>
								</SelectTrigger>
								<SelectPopup alignItemWithTrigger={false} className="border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl">
									{categories.map((category) => (
										<SelectItem key={category} value={category} className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20">
											{category}
										</SelectItem>
									))}
								</SelectPopup>
							</Select>
						</div>
						{(selectedCategories.length > 0 || searchTerm) && (
							<Button 
								variant="outline"
								size="lg"
								onClick={() => {
									setSelectedCategories([]);
									setSearchTerm("");
								}}
								className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400 transition-all duration-200 rounded-xl"
							>
								<Filter className="h-4 w-4 mr-2" />
								Limpar filtros
							</Button>
						)}
					</div>
				</div>
			{filteredEvents && filteredEvents.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Search />
						</EmptyMedia>
						<EmptyTitle>Nenhum evento encontrado</EmptyTitle>
						<EmptyDescription>
							Tente ajustar os filtros de categoria ou busca para encontrar mais eventos.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex gap-2">
							<Button 
								size="sm" 
								onClick={() => {
									setSelectedCategories([]);
									setSearchTerm("");
								}}
							>
								<Filter className="h-4 w-4 mr-2" />
								Limpar filtros
							</Button>
						</div>
					</EmptyContent>
				</Empty>
			) : (
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{filteredEvents?.map((event) => {
					const isRegistered = isUserRegistered(event.id);

					return (
						<Link key={event.id} to="/evento/$eventoId" params={{ eventoId: event.id }} className="block group">
							<Card className={`overflow-hidden transition-all duration-300 h-full flex flex-col ${
								isRegistered 
									? "bg-blue-50 dark:bg-blue-950/30" 
									: "bg-white dark:bg-gray-800/50"
							} rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200/80 dark:border-gray-700/60 hover:border-blue-400 dark:hover:border-blue-600`}>
								{event.imageUrl && (
									<div className="overflow-hidden relative -mt-6">
										<img
											src={event.imageUrl}
											alt={`Imagem do evento ${event.title}`}
											className="w-full h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
										{isRegistered && (
											<div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
												<CheckCircle className="h-4 w-4" />
												<span>Inscrito</span>
											</div>
										)}
									</div>
								)}
								<CardHeader className="flex-1 flex flex-col justify-between">
									<div>
										<CardTitle className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
											{event.title}
										</CardTitle>
										<CardDescription className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
											{event.description}
										</CardDescription>
									</div>
									<div className="mt-4 space-y-3 text-sm">
										<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
											<CalendarDays className="h-4 w-4" />
											<span>{new Date(event.startTime).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
										</div>
										<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
											<MapPin className="h-4 w-4" />
											<span>{event.location || "Não informado"}</span>
										</div>
										<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
											<Users className="h-4 w-4" />
											<span>{event.participantCount} / {event.maxCapacity || "∞"} participantes</span>
										</div>
									</div>
								</CardHeader>
								<CardFooter>
									{event.categories.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{event.categories.map((cat) => (
												<span key={cat.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
													{cat.title}
												</span>
											))}
										</div>
									)}
								</CardFooter>
							</Card>
						</Link>
					);
				})}
				</div>
			)}
		</div>
		</div>
	);
}