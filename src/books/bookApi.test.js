import { bookApi } from "./bookApi";

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: () => ({
      get: (...args) => mockGet(...args),
      post: (...args) => mockPost(...args),
      put: (...args) => mockPut(...args)
    })
  }
}));

beforeEach(() => {
  localStorage.clear();
  mockGet.mockReset();
  mockPost.mockReset();
  mockPut.mockReset();
  mockGet.mockRejectedValue({ code: "ERR_NETWORK" });
});

test("keeps the catalogue usable and editable when the API is offline", async () => {
  const books = await bookApi.list();
  expect(books.length).toBeGreaterThan(0);
  expect(books[0]).toMatchObject({ title: "Failing Light", category: "Adventure", available: 2 });
  expect(bookApi.isLocalMode()).toBe(true);

  const created = await bookApi.create({ title: "Offline title", author: "Local reader", category: "Classic", type: "physical", total: 3, available: 3 });
  const updated = await bookApi.update(created.id, { ...created, available: 2 });
  expect(await bookApi.get(created.id)).toMatchObject({ title: "Offline title", available: 2 });
  expect(updated.id).toBe(created.id);
  expect(JSON.parse(localStorage.getItem("books"))).toContainEqual(expect.objectContaining({ id: created.id, available: 2 }));
});
