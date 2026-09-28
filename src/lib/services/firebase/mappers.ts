import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";

/**
 * O Firestore guarda o id separado dos dados; aqui juntamos os dois
 * para as telas receberem o mesmo formato do modo demonstração.
 */
export function comId<T extends { id: string }>(snap: QueryDocumentSnapshot | DocumentSnapshot): T {
  return { ...(snap.data() as Omit<T, "id">), id: snap.id } as T;
}
