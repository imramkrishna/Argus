import { z } from "zod";

export const SubtaskKindSchema = z.enum(["research", "data"]);
