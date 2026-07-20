import { hashPassword, verifyPassword } from "./utils/password";
import { signAccessToken, verifyAccessToken } from "./utils/tokens";

describe("auth utilities", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Secret123!");
    expect(hash).not.toEqual("Secret123!");
    expect(await verifyPassword("Secret123!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("signs and verifies access tokens", () => {
    const token = signAccessToken({
      sub: "abc",
      email: "a@b.com",
      role: "recruiter",
      tokenVersion: 0
    });
    const payload = verifyAccessToken(token);
    expect(payload.email).toBe("a@b.com");
    expect(payload.role).toBe("recruiter");
  });
});
