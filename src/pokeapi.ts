import { Cache } from "./pokecache.js";

export type ShallowLocation = {
  name: string;
  url: string;
};

export type ShallowLocations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ShallowLocation[];
};

export type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  [key: string]: unknown;
};

export type LocationPokemon = {
  pokemon: {
    name: string;
    url: string;
  };
};

export type Location = {
  id: number;
  name: string;
  pokemon_encounters: LocationPokemon[];
};

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  private cache: Cache;

  constructor(cacheInterval: number) {
    this.cache = new Cache(cacheInterval);
  }

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url = pageURL ?? `${PokeAPI.baseURL}/location-area/`;

    const cached = this.cache.get<ShallowLocations>(url);
    if (cached !== undefined) {
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `failed to fetch locations: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as ShallowLocations;
    this.cache.add(url, data);
    return data;
  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}/`;

    const cached = this.cache.get<Location>(url);
    if (cached !== undefined) {
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `failed to fetch location "${locationName}": ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as Location;
    this.cache.add(url, data);
    return data;
  }

  closeCache(): void {
    this.cache.stopReapLoop();
  }

  async fetchPokemon(pokemonName: string): Promise<Pokemon> {
    const url = `${PokeAPI.baseURL}/pokemon/${pokemonName}/`;

    const cached = this.cache.get<Pokemon>(url);
    if (cached !== undefined) {
      return cached;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `failed to fetch pokemon "${pokemonName}": ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as Pokemon;
    this.cache.add(url, data);
    return data;
  }
}
