require 'selenium-cucumber'
require 'capybara/cucumber'
require 'rspec/expectations'

# Do Not Remove This File
# Add your custom steps here
# $driver is instance of webdriver use this instance to write your custom code

Given(/^I open "([^"]*)""$/) do |arg1|
   step %[I navigate to "#{arg1}"]
end

Then(/^I see "([^"]*)"$/) do |arg1|
   step page.has_content?(arg1)
end
