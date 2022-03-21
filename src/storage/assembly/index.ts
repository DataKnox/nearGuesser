import { context, u128, PersistentMap, logging, ContractPromiseBatch, RNG } from "near-sdk-as";

enum GameState { Created, InProgress, Completed, NotFound }

@nearBindgen
export class Game {
    id: u32;
    gameState: GameState;
    deposit1: u128;
    player1: string;
    player1Guess: u32;
    compGuess: u32;
    winner: string;
    loser: string;


    constructor() {
        const idValue = new RNG<u32>(1, u32.MAX_VALUE)
        this.id = idValue.next()
        this.gameState = GameState.Created
        this.deposit1 = context.attachedDeposit
        this.player1 = context.sender
    }
}

const games = new PersistentMap<u32, Game>("m")

export function createGame(): u32 {
    let game = new Game()
    logging.log("Attached Deposit with this account " + context.attachedDeposit.toString());
    logging.log("In contract");
    games.set(game.id, game)
    logging.log("game ID is " + game.id.toString())
    return game.id
}

export function makeAGuess(gameId: u32, guess: u32): string {
    const game = games.getSome(gameId);
    if (game != null) {
        if (game.gameState == GameState.Created) {
            if (context.sender == game.player1) {
                game.gameState = GameState.InProgress
                game.player1Guess = guess
                let rngNum = new RNG<u32>(1, 10)
                let selNum = rngNum.next()
                game.compGuess = selNum
                if (guess == selNum) {
                    game.gameState = GameState.Completed
                    game.winner = game.player1
                    games.set(game.id, game)
                    logging.log("you won!")
                    return "Omg!"
                }
                else {
                    game.gameState = GameState.Completed
                    game.loser = game.player1
                    games.set(game.id, game)
                    logging.log("you lost. Comp guess was " + selNum.toString())
                    return "lost"
                }
            }
            return "Player not found"
        }
        return "Game not created"
    }
    return "Game Not Found";
}