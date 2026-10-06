const clean = (val?: string) => (val ? val.trim().replace(/^["']|["']$/g, "") : undefined);

export const AUTH_SECRET_VALUE =
  clean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) ||
  "a3fea869bbf729010eacaacc37313b1c715199a76a70c76fd2f81a3fa39bad75";
