# AI Provider Configuration Guide

The API Flow Testing Application supports multiple AI providers for intelligent flow generation, analysis, and suggestions. This guide explains how to configure and use each provider.

## Supported AI Providers

### 1. OpenAI (Recommended)

**Model Used:** GPT-4 Turbo

**Pros:**
- Fast response times
- High-quality code and JSON generation
- Excellent at following structured prompts
- Widely available

**Configuration:**

1. **Get API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or log in
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Set in `.env`:**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-key-here
```

3. **Cost:** Pay-per-use pricing. GPT-4 Turbo costs approximately $0.01 per 1K tokens (input) and $0.03 per 1K tokens (output)

---

### 2. Anthropic Claude

**Model Used:** Claude 3.5 Sonnet

**Pros:**
- Excellent reasoning capabilities
- Great at understanding complex requirements
- Strong safety features
- Very reliable JSON generation

**Configuration:**

1. **Get API Key:**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Create a new API key
   - Copy the key (starts with `sk-ant-`)

2. **Set in `.env`:**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

3. **Cost:** Pay-per-use pricing. Claude 3.5 Sonnet costs approximately $0.003 per 1K tokens (input) and $0.015 per 1K tokens (output)

---

### 3. Google Gemini

**Model Used:** Gemini Pro

**Pros:**
- Good performance
- Competitive pricing
- Free tier available
- Fast inference

**Configuration:**

1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key

2. **Set in `.env`:**
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyYour-key-here
```

3. **Cost:** Free tier available (60 requests per minute). Paid plans available for higher usage.

---

## Choosing the Right Provider

### For Most Users: OpenAI
- Best balance of quality and speed
- Excellent documentation
- Reliable and stable

### For Advanced Reasoning: Anthropic Claude
- Superior at understanding complex API flows
- Best for intricate test scenarios
- Excellent at maintaining context

### For Budget-Conscious: Google Gemini
- Free tier is generous
- Good for development and testing
- Reliable performance

---

## AI Features in the Application

All providers support these features:

### 1. Flow Generation
Generate complete test flows from natural language:

**Example Prompt:**
```
Create a flow that:
1. Logs in as a user with email/password
2. Fetches the user's profile
3. Updates the user's email address
4. Verifies the email was updated
```

**AI Will Generate:**
- Complete flow with multiple steps
- Proper variable extraction (token, userId, etc.)
- Appropriate assertions for each step
- Error handling considerations

### 2. Assertion Suggestions
For any API step, the AI can suggest:
- Status code validations
- Response field checks
- Data type validations
- Response time limits
- Business logic assertions

### 3. Test Data Generation
Generate test data for three scenarios:
- **Positive:** Valid data that should succeed
- **Negative:** Invalid data that should fail
- **Edge Cases:** Boundary values and special conditions

### 4. Failure Analysis
When a flow fails, AI analyzes:
- What went wrong
- Why it failed
- Root cause identification
- Specific fix recommendations
- Suggestions to improve robustness

---

## Switching Providers

You can easily switch between providers:

1. Stop the backend server
2. Update `AI_PROVIDER` in `.env`
3. Ensure the correct API key is set
4. Restart the backend

Example:
```env
# Switch from OpenAI to Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
# OpenAI key can remain but won't be used
```

---

## Troubleshooting

### Error: "API key not found"
- Ensure the API key is set in `.env`
- Check that you're using the correct key for your chosen provider
- Restart the backend after changing `.env`

### Error: "Rate limit exceeded"
- You've exceeded your API quota
- Wait a few minutes and try again
- Consider upgrading your plan or switching providers

### Error: "Invalid API key"
- Key format is incorrect
- Key has been revoked
- Generate a new key from the provider's dashboard

### AI Responses Are Slow
- This is normal; AI generation can take 5-15 seconds
- Anthropic is typically fastest, followed by OpenAI, then Gemini
- Complex flows take longer to generate

### Poor Quality Responses
- Ensure you're using the latest version of the application
- Try providing more context in your prompts
- Consider switching to Anthropic for better reasoning

---

## Best Practices

### For Flow Generation:
1. **Be Specific:** Provide detailed requirements
   - Good: "Create a flow that tests user registration with email verification"
   - Bad: "Test user stuff"

2. **Provide Context:** Mention business rules
   - Example: "The login returns a JWT token that expires in 1 hour"

3. **Iterate:** Generate a basic flow, then refine it

### For Cost Optimization:
1. Use simpler prompts when possible
2. Cache generated flows instead of regenerating
3. Use the free Gemini tier for development
4. Switch to paid providers for production

### For Best Results:
1. **OpenAI:** Best for standard CRUD operations and REST APIs
2. **Anthropic:** Best for complex business logic and GraphQL
3. **Gemini:** Best for simple flows and budget-conscious projects

---

## API Usage Monitoring

Track your AI usage:

### OpenAI
- Dashboard: https://platform.openai.com/usage
- Set spending limits in settings

### Anthropic
- Console: https://console.anthropic.com/
- Monitor usage in the dashboard

### Gemini
- AI Studio: https://makersuite.google.com/
- Check quota usage

---

## Security Notes

1. **Never commit API keys to Git**
   - `.env` is in `.gitignore` by default
   - Use environment variables in production

2. **Rotate keys regularly**
   - Generate new keys every 90 days
   - Revoke old keys immediately if compromised

3. **Use separate keys for dev/prod**
   - Different keys for different environments
   - Easier to track usage and costs

4. **Monitor usage**
   - Set up billing alerts
   - Review usage weekly
   - Watch for unexpected spikes

---

## Future Enhancements

Planned improvements:
- Support for Azure OpenAI
- Local LLM support (Ollama, LM Studio)
- Custom model selection per provider
- Response caching for cost reduction
- Batch processing for multiple flows

---

## Support

For issues with AI features:
1. Check the troubleshooting section above
2. Verify your API key is valid
3. Check provider status pages:
   - OpenAI: https://status.openai.com/
   - Anthropic: https://status.anthropic.com/
   - Google: https://status.cloud.google.com/

For application issues, see [SETUP.md](./SETUP.md) or file an issue on GitHub.
