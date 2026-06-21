import CircuitBreaker from 'opossum'
import { Logger } from '@nestjs/common'

const logger = new Logger('CircuitBreaker')

const OPTIONS = {
  timeout: 5000,                    // abort call after 5s
  errorThresholdPercentage: 50,     // open when 50% of calls fail
  resetTimeout: 30_000,             // half-open probe after 30s
  volumeThreshold: 5,               // need at least 5 calls before tripping
}

type AnyFn = () => Promise<unknown>
type Breaker = CircuitBreaker<[AnyFn], unknown>

const breakers = new Map<string, Breaker>()

function getBreaker(name: string): Breaker {
  if (!breakers.has(name)) {
    const b: Breaker = new CircuitBreaker<[AnyFn], unknown>(
      (fn: AnyFn) => fn(),
      { ...OPTIONS, name },
    )
    b.on('open',     () => logger.warn(`Circuit [${name}] OPEN — failing fast for 30s`))
    b.on('halfOpen', () => logger.log(`Circuit [${name}] HALF-OPEN — testing recovery`))
    b.on('close',    () => logger.log(`Circuit [${name}] CLOSED — recovered`))
    breakers.set(name, b)
  }
  return breakers.get(name)!
}

export async function withBreaker<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return getBreaker(name).fire(fn as AnyFn) as Promise<T>
}
