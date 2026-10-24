import asyncio
import unittest
from types import SimpleNamespace

import bot


class FakeDatabase:
    def __init__(self):
        self.balance = 1_000
        self.removed_stakes = 0
        self.payouts = 0

    async def is_banned(self, _user_id):
        return False

    async def get_active_booster(self, _user_id):
        return None

    async def get_coins(self, _user_id):
        return self.balance, 0

    async def remove_coins(self, _user_id, amount):
        await asyncio.sleep(0)
        self.removed_stakes += 1
        self.balance -= amount
        return True

    async def clear_active_booster(self, _user_id):
        return None

    async def add_coins(self, _user_id, amount):
        self.payouts += 1
        self.balance += amount
        return self.balance

    async def get_display_balance(self, _user_id):
        return self.balance


class FakeMessage:
    def __init__(self, user_id, message_id, text):
        self.from_user = SimpleNamespace(
            id=user_id, first_name="Test", full_name="Test", username="test", is_bot=False
        )
        self.chat = SimpleNamespace(id=user_id, type="private")
        self.message_id = message_id
        self.text = text

    async def reply(self, *_args, **_kwargs):
        return SimpleNamespace(message_id=self.message_id + 100)


class FakeCallback:
    def __init__(self, user_id, cell):
        self.from_user = SimpleNamespace(
            id=user_id, first_name="Test", full_name="Test", username="test"
        )
        self.data = f"mines_cell_{cell}"
        self.message = SimpleNamespace(
            message_id=42,
            chat=SimpleNamespace(id=user_id),
            edit_text=self._edit_text,
        )

    async def _edit_text(self, *_args, **_kwargs):
        return None

    async def answer(self, *_args, **_kwargs):
        return None


class GameActionSerializationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.database = bot.db
        self.school_record = bot.school_event.record
        self.school_game = bot.school_game
        self.send_game_log = bot.send_game_log
        self.games = bot.active_games.copy()
        self.fake_database = FakeDatabase()
        bot.db = self.fake_database
        bot.active_games.clear()
        bot.user_game_locks.clear()

        async def record(*_args, **_kwargs):
            await asyncio.sleep(0)

        async def noop(*_args, **_kwargs):
            return ""

        bot.school_event.record = record
        bot.school_game = noop
        bot.send_game_log = noop

    async def asyncTearDown(self):
        bot.db = self.database
        bot.school_event.record = self.school_record
        bot.school_game = self.school_game
        bot.send_game_log = self.send_game_log
        bot.active_games.clear()
        bot.active_games.update(self.games)
        bot.user_game_locks.clear()

    async def test_concurrent_crash_starts_charge_only_one_stake(self):
        await asyncio.gather(
            bot.cmd_crash(FakeMessage(1, 1, "/crash normal 100"), None),
            bot.cmd_crash(FakeMessage(1, 2, "/crash normal 100"), None),
        )

        self.assertEqual(self.fake_database.removed_stakes, 1)
        self.assertEqual(bot.active_games[1]["game"], "crash")

    async def test_concurrent_final_mines_cells_pay_only_once(self):
        safe_cells = bot.MINES_GRID_SIZE - bot.MINES_COUNT
        bot.active_games[1] = {
            "game": "mines",
            "token": "test-token",
            "bet": 100,
            "mines": set(range(safe_cells, bot.MINES_GRID_SIZE)),
            "opened": set(range(safe_cells - 2)),
            "chat_id": 1,
            "message_id": 42,
            "expires": bot.time.time() + bot.CASINO_TIMEOUT,
            "booster": None,
        }

        await asyncio.gather(
            bot.mines_open_cell(FakeCallback(1, safe_cells - 2), None),
            bot.mines_open_cell(FakeCallback(1, safe_cells - 1), None),
        )

        self.assertEqual(self.fake_database.payouts, 1)
        self.assertNotIn(1, bot.active_games)


if __name__ == "__main__":
    unittest.main()
