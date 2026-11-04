import fs from "fs";
import path from "path";
import {
  ChampionId,
  ChampionshipGame,
  ChampionshipResponse,
  ChampionshipSeason,
} from "../../shared/championship";

interface ChampionshipData {
  version: 1;
  seasons: ChampionshipSeason[]; // last one is the current season
}

/**
 * Persists championship games as a JSON file in DATA_DIR.
 * Writes go to a temp file first and are then renamed, so a crash
 * never leaves a half-written file behind.
 */
export class ChampionshipStore {
  private file: string;
  private dir: string;
  private data: ChampionshipData;

  constructor(dir: string) {
    this.dir = dir;
    this.file = path.join(dir, "championship.json");
    fs.mkdirSync(dir, { recursive: true });
    this.data = this.load();
  }

  private load(): ChampionshipData {
    if (fs.existsSync(this.file)) {
      return JSON.parse(fs.readFileSync(this.file, "utf8"));
    }
    const data: ChampionshipData = {
      version: 1,
      seasons: [this.newSeason(1)],
    };
    this.write(data);
    return data;
  }

  private newSeason(number: number): ChampionshipSeason {
    return {
      number,
      startedAt: new Date().toISOString(),
      endedAt: null,
      games: [],
    };
  }

  private write(data: ChampionshipData): void {
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, this.file);
  }

  private get current(): ChampionshipSeason {
    return this.data.seasons[this.data.seasons.length - 1];
  }

  addGame(game: ChampionshipGame): void {
    this.current.games.push(game);
    this.write(this.data);
  }

  /** Archives the current season and starts a new one at 0:0. */
  reset(): number {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.copyFileSync(
      this.file,
      path.join(this.dir, `championship-backup-${stamp}.json`),
    );

    this.current.endedAt = new Date().toISOString();
    const next = this.newSeason(this.current.number + 1);
    this.data.seasons.push(next);
    this.write(this.data);
    return next.number;
  }

  getResponse(seasonNumber?: number): ChampionshipResponse | null {
    const season = seasonNumber
      ? this.data.seasons.find((s) => s.number === seasonNumber)
      : this.current;
    if (!season) return null;

    return {
      seasons: this.data.seasons.map((s) => {
        const wins: Record<ChampionId, number> = { fane: 0, lebo: 0 };
        for (const g of s.games) if (g.winner) wins[g.winner]++;
        return {
          number: s.number,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
          gameCount: s.games.length,
          wins,
        };
      }),
      season,
      currentSeason: this.current.number,
    };
  }
}
