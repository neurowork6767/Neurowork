/**
 * Camada de serviços (RNF-09): as telas importam dados apenas daqui.
 * Para conectar o Firebase, basta reimplementar estas funções mantendo as mesmas assinaturas.
 */
export * from "./auth.service";
export * from "./vagas.service";
export * from "./candidaturas.service";
export * from "./empresa.service";
export * from "./relatorios.service";
export { resetDb as restaurarDadosDeExemplo, ServiceError } from "./storage";
