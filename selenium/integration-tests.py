import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(5)
        self.driver.get("http://127.0.0.1:8080/app/#/")

    def tearDown(self):
        self.driver.close()

    def adminLogin(self):
        # press adminbutton
        self.driver.find_element_by_xpath("//div[@class='settings']").click()

        # write credentials
        database = self.driver.find_element_by_id("database")
        user = self.driver.find_element_by_id("email")
        password = self.driver.find_element_by_id("pwd")
        database.send_keys("demodb")
        user.send_keys("admin")
        password.send_keys("demo44320")

        # login
        password.send_keys(Keys.RETURN)

    def createChannel(self, name, description):
        self.driver.find_element_by_xpath("//button[contains(text(), 'New channel')]").click()
        channelName = self.driver.find_element_by_id("channel_name")
        channelDescription = self.driver.find_element_by_id("channel_description")
        channelName.send_keys(name)
        channelDescription.send_keys(description)
        self.driver.find_element_by_xpath("//button[contains(text(), 'Confirm')]").click()

    def deleteChannel(self, name):
        self.driver.get("http://127.0.0.1:8080/app/#/admin/channels")
        self.driver.find_element_by_css_selector("option[label=" + name + "]").click()
        self.driver.find_element_by_xpath("//button[contains(text(), 'Delete channel')]").click()
        if (name in self.driver.find_element_by_css_selector("h3[class*='modal-title']").text):
            self.driver.find_element_by_css_selector("button[class*='btn-confirm']").click()

    # Check that adminlogin button exists
    def test_adminbutton_exists(self):
        settingsButton = self.driver.find_element_by_xpath("//div[@class='settings']")
        self.assertTrue(settingsButton.is_displayed())

    # Test adminlogin
    def test_adminlogin(self):
        # press adminbutton
        self.driver.find_element_by_xpath("//div[@class='settings']").click()
        loginBox = self.driver.find_element_by_xpath("//div[@class='modal-dialog modal-sm']")
        self.assertTrue(loginBox.is_displayed())

        # test exiting from login screen
        loginBox.send_keys(Keys.ESCAPE)
        time.sleep(1)
        self.assertFalse(len(self.driver.find_elements_by_xpath("//div[@class='modal-dialog modal-sm']")))

        # login
        self.adminLogin()

        # check that adminview header is displayed
        header = self.driver.find_element_by_css_selector("h1[class*='channel-name-header']")
        self.assertTrue(header.is_displayed())

        # Go back to channel view
        self.driver.find_element_by_xpath("//div[@class='settings']").click()
        header = self.driver.find_elements_by_css_selector("h1[class*='channel-name-header']")
        self.assertFalse(len(header))

        # And once again to admin view
        self.driver.find_element_by_xpath("//div[@class='settings']").click()
        header = self.driver.find_element_by_css_selector("h1[class*='channel-name-header']")
        self.assertTrue(header.is_displayed())

    # Test adminlogin with incorrect credentials
    def test_adminlogin_wrong_credentials(self):
        # press adminbutton
        self.driver.find_element_by_xpath("//div[@class='settings']").click()
        database = self.driver.find_element_by_id("database")
        user = self.driver.find_element_by_id("email")
        password = self.driver.find_element_by_id("pwd")
        loginButton = self.driver.find_element_by_xpath("//button[@type='submit']")

        # empty fields
        loginButton.click()
        self.assertFalse(len(self.driver.find_elements_by_css_selector("h1[class*='channel-name-header']")))

        # wrong databse
        database.send_keys("thisDatabaseshouldntexist42352")
        user.send_keys("admin")
        password.send_keys("demo44320")
        loginButton.click()
        self.assertFalse(len(self.driver.find_elements_by_css_selector("h1[class*='channel-name-header']")))

        # wrong username
        database.clear()
        user.clear()
        password.clear()
        database.send_keys("demodb")
        user.send_keys("thisUsershouldntexist5345346")
        password.send_keys("demo44320")
        loginButton.click()
        self.assertFalse(len(self.driver.find_elements_by_css_selector("h1[class*='channel-name-header']")))

        # wrong password
        database.clear()
        user.clear()
        password.clear()
        database.send_keys("demodb")
        user.send_keys("admin")
        password.send_keys("totallywrongPasswordhere")
        loginButton.click()
        self.assertFalse(len(self.driver.find_elements_by_css_selector("h1[class*='channel-name-header']")))

    # Test adding new channel
    def test_channel_create_and_delete(self):
        self.adminLogin()
        if (len(self.driver.find_elements_by_css_selector("option[label='testchannel1']")) != 0):
            raise("channel with name 'testchannel1' already exists, remove it before running test")

        try:
            # create new channel
            self.createChannel("testchannel1", "description for testchannel 1")

            # test that it exists
            self.assertEqual(len(self.driver.find_elements_by_css_selector("option[label='testchannel1']")), 1)
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.assertEqual(len(self.driver.find_elements_by_xpath("//a[contains(text(), 'testchannel1')]")), 1)
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
        finally:
            # delete temporarily channel and check that it is deleted
            self.deleteChannel("testchannel1")
            time.sleep(1)
            self.assertEqual(len(self.driver.find_elements_by_css_selector("option[label='testchannel1']")), 0)

    # Test duplicating channel
    def test_channel_duplicate(self):
        self.adminLogin()
        if (len(self.driver.find_elements_by_css_selector("option[label='testchannel1']")) != 0):
            raise("channel with name 'testchannel1' already exists, remove it before running test")
        if (len(self.driver.find_elements_by_css_selector("option[label='testchannel2']")) != 0):
            raise("channel with name 'testchannel2' already exists, remove it before running test")

        try:
            # create new channel
            self.createChannel("testchannel1", "description for testchannel 1")
            time.sleep(1)

            # duplicate channel
            self.driver.find_element_by_xpath("//button[contains(text(), 'Duplicate channel')]").click()
            channelName = self.driver.find_element_by_id("channel_name")
            channelDescription = self.driver.find_element_by_id("channel_description")
            channelName.clear()
            channelName.send_keys("testchannel2")
            channelDescription.clear()
            channelDescription.send_keys("description for testchannel 2")
            self.driver.find_element_by_xpath("//button[contains(text(), 'Confirm')]").click()

            # test that it exists
            self.assertEqual(len(self.driver.find_elements_by_css_selector("option[label='testchannel2']")), 1)
        finally:
            # delete temporarily channels
            self.deleteChannel("testchannel1")
            time.sleep(1)
            self.deleteChannel("testchannel2")

    # Test creating channel with name that already exists
    def test_channel_create_duplicate(self):
        self.adminLogin()
        if (len(self.driver.find_elements_by_css_selector("option[label='testchannel1']")) != 0):
            raise("channel with name 'testchannel1' already exists, remove it before running test")

        try:
            # create new channel
            self.createChannel("testchannel1", "description for testchannel 1")
            time.sleep(1)
            self.driver.find_element_by_xpath("//button[contains(text(), 'New channel')]").click()
            channelName = self.driver.find_element_by_id("channel_name")
            channelDescription = self.driver.find_element_by_id("channel_description")
            channelName.send_keys("testchannel1")
            channelDescription.send_keys("description for testchannel 1")
            self.driver.find_element_by_xpath("//button[contains(text(), 'Confirm')]").click()

            # Confirm that alert was raised
            try:
                WebDriverWait(self.driver, 3).until(EC.alert_is_present(), 'Timed out waiting for PA creation ' + 'confirmation popup to appear.')
                alert = self.driver.switch_to_alert()
                alert.accept()
            except TimeoutException:
                self.assertTrue(False, "No alert message was found")

            self.driver.find_element_by_xpath("//button[contains(text(), 'Cancel')]").click()
        finally:
            # delete temporarily channel
            self.deleteChannel("testchannel1")

    # Test creating channel and setting it to default
    def test_channel_set_default(self):
        self.adminLogin()

        # save current channel names and default channel
        channels = []
        for channel in self.driver.find_element_by_css_selector("select[class*='form-control']").find_elements_by_css_selector("*"):
            channels.append(channel.text)
        for channel in channels:
            if (channel.endswith(' (default)')):
                oldDefault = channel
        self.assertTrue(oldDefault in channels)

        try:
            # create new channel, set it to default
            self.createChannel("testchannel1", "description for testchannel 1")
            time.sleep(1)
            self.driver.find_element_by_xpath("//button[contains(text(), 'Set default channel')]").click()
            self.driver.find_element_by_xpath("//button[contains(text(), 'Confirm')]").click()

            # test that original default channel is not default anymore
            time.sleep(1)
            channels = []
            for channel in self.driver.find_element_by_css_selector("select[class*='form-control']").find_elements_by_css_selector("*"):
                channels.append(channel.text)
            self.assertFalse(oldDefault in channels)

            # check that mainpage redirects to new default channel
            self.driver.get("http://127.0.0.1:8080/app/#/")
            self.assertEqual("testchannel1", self.driver.find_element_by_css_selector("span[id='btn-select-channel']").text)
            self.driver.find_element_by_xpath("//div[@class='settings']").click()

            # set original default channel back to default
            self.driver.find_element_by_css_selector("option[label^=" + oldDefault[:-10] + "]").click()
            self.driver.find_element_by_xpath("//button[contains(text(), 'Set default channel')]").click()
            self.driver.find_element_by_xpath("//button[contains(text(), 'Confirm')]").click()

            # test that original default channel is default again
            time.sleep(1)
            channels = []
            for channel in self.driver.find_element_by_css_selector("select[class*='form-control']").find_elements_by_css_selector("*"):
                channels.append(channel.text)
            self.assertTrue(oldDefault in channels)
        finally:
            # delete temp channel
            self.deleteChannel("testchannel1")

    # Test deleting default channel
    def test_channel_delete_default(self):
        self.adminLogin()

        defaultName = ""
        # save default channel name
        for channel in self.driver.find_element_by_css_selector("select[class*='form-control']").find_elements_by_css_selector("*"):
            if (channel.text.endswith(' (default)')):
                defaultName = channel.text

        # select default channel
        self.driver.find_element_by_css_selector("option[label^=" + defaultName[:-10] + "]").click()

        # test that deletebutton cannot be clicked
        self.assertFalse(self.driver.find_element_by_xpath("//button[contains(text(), 'Delete channel')]").is_enabled())

    # Test adding and removing module
    def test_module_add_and_remove(self):
        self.adminLogin()

        try:
            self.createChannel("testchannel1", "description for testchannel 1")
            time.sleep(1)

            # check that module named Odoo Invoice isn't added to channel
            self.assertFalse(len(self.driver.find_elements_by_xpath("//span[contains(text(), 'Odoo Invoice')]")))
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-micro")))
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("option[label=" + "testchannel1" + "]").click()

            # add new module to channel
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Odoo Invoice')]").click()

            # test that module exists in the channel
            self.assertTrue(len(self.driver.find_elements_by_xpath("//span[contains(text(), 'Odoo Invoice')]")))
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-micro")))
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("option[label=" + "testchannel1" + "]").click()

            # remove module
            self.driver.find_element_by_css_selector("input[class*='btn-remove-module']").click()

            # test that module is removed
            self.assertFalse(len(self.driver.find_elements_by_xpath("//span[contains(text(), 'Odoo Invoice')]")))
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-micro")))
            self.driver.find_element_by_xpath("//div[@class='settings']").click()

        finally:
            # delete channel
            self.deleteChannel("testchannel1")

    # Test reordering modules in a channel
    def test_module_reorder(self):
        self.adminLogin()

        try:
            self.createChannel("testchannel1", "description for testchannel 1")

            # add new modules to channel
            time.sleep(1)
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Odoo Invoice')]").click()
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Odoo Opportunities')]").click()
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Weather')]").click()
            time.sleep(1)

            # test that modules are in order that they were added
            moduleList = []
            for module in self.driver.find_elements_by_css_selector("ul[class*='module-list'] li div span"):
                if (module.text):
                    moduleList.append(module.text)
            self.assertEqual(moduleList, ["Odoo Invoice", "Odoo Opportunities", "Weather"])

            # go to newly created channel
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()

            # test that modules are in the same order as in admin view
            moduleList = []
            for module in self.driver.find_elements_by_css_selector("div[class^='micro-module']"):
                moduleList.append(module.find_element_by_xpath(".//h1").text)
            self.assertEqual(moduleList, ["Invoices", "Opportunities", "Weather today"])

            # go back to admin view
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("option[label=" + "testchannel1" + "]").click()

            # change the order of modules in channel
            time.sleep(1)
            source_element = self.driver.find_elements_by_css_selector("ul[class*='module-list'] li")[0]
            dest_element = self.driver.find_elements_by_css_selector("ul[class*='module-list'] li")[1]
            ActionChains(self.driver).click_and_hold(source_element).perform()
            ActionChains(self.driver).move_to_element(dest_element).perform()
            ActionChains(self.driver).move_by_offset(0, 1).perform()
            ActionChains(self.driver).release(dest_element).perform()

            # test that modules are in correct order
            moduleList = []
            for module in self.driver.find_elements_by_css_selector("ul[class*='module-list'] li div span"):
                if (module.text):
                    moduleList.append(module.text)
            self.assertEqual(moduleList, ["Odoo Opportunities", "Odoo Invoice", "Weather"])

            # go to channel
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()

            # test that modules are in correct order
            moduleList = []
            for module in self.driver.find_elements_by_css_selector("div[class^='micro-module']"):
                moduleList.append(module.find_element_by_xpath(".//h1").text)
            self.assertEqual(moduleList, ["Opportunities", "Invoices", "Weather today"])

        finally:
            # delete channel
            self.deleteChannel("testchannel1")

    # Test the returnbutton that takes you from channel to dashboard
    def test_return_button(self):
        self.adminLogin()

        try:
            self.createChannel("testchannel1", "description for testchannel 1")

            # add new module to channel
            time.sleep(1)
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Odoo Invoice')]").click()

            # go to dashboard and test that microview is displayed
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-micro")))

            # go to macroview and back to dashboard
            # TODO: find out better way to test if browser is in micro/macro view
            self.driver.find_element_by_css_selector("ses-odoo-invoice-micro").click()
            self.assertTrue("module" in self.driver.current_url)
            self.driver.find_element_by_xpath("//div[@class='db-return-button']").click()
            self.assertFalse("module" in self.driver.current_url)

        finally:
            # delete channel
            self.deleteChannel("testchannel1")

    # Test navigatebutton that take you between modules in a channel
    def test_navibuttons(self):
        self.adminLogin()

        try:
            self.createChannel("testchannel1", "description for testchannel 1")

            # add new modules to channel
            time.sleep(1)
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Odoo Invoice')]").click()
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Odoo Opportunities')]").click()
            self.driver.find_element_by_css_selector("div[class*='add-module-div']").click()
            self.driver.find_element_by_xpath("//span[contains(text(), 'Weather')]").click()

            # go to first module and test that it is displayed
            self.driver.find_element_by_xpath("//div[@class='settings']").click()
            self.driver.find_element_by_css_selector("div[class='channel dropdown']").click()
            self.driver.find_element_by_xpath("//a[contains(text(), 'testchannel1')]").click()
            self.driver.find_element_by_css_selector("ses-odoo-invoice-micro").click()
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-opportunities-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-weather-macro")))

            # click next and test that only opportunities is displayed
            self.driver.find_element_by_css_selector("div[class='navi-right']").click()
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-macro")))
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-odoo-opportunities-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-weather-macro")))

            # click next  and test that only weather is displayed
            self.driver.find_element_by_css_selector("div[class='navi-right']").click()
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-opportunities-macro")))
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-weather-macro")))

            # click next and test taht only invoices is displayed
            self.driver.find_element_by_css_selector("div[class='navi-right']").click()
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-opportunities-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-weather-macro")))

            # click previous and test that only weather is displayed
            self.driver.find_element_by_css_selector("div[class='navi-left']").click()
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-invoice-macro")))
            self.assertFalse(len(self.driver.find_elements_by_css_selector("ses-odoo-opportunities-macro")))
            self.assertTrue(len(self.driver.find_elements_by_css_selector("ses-weather-macro")))

        finally:
            # delete channel
            self.deleteChannel("testchannel1")

if __name__ == "__main__":
    unittest.main()
