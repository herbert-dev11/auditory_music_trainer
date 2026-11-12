import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Testes ficam ao lado do código: src/dominio/notas.test.ts
    include: ['src/**/*.test.ts'],
    // Enquanto ainda não existe nenhum teste, não falhar
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      // RNF10: cobertura medida só nos módulos puros
      include: ['src/dominio/**', 'src/exercicio/**'],
      exclude: ['**/*.test.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
