using HousingRentalApp.Api.Data;
using HousingRentalApp.Api.Data.Repositories;
using HousingRentalApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
namespace HousingRentalApp.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Configuration.AddEnvironmentVariables();

            builder.Services.AddHealthChecks();
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseSwagger();
            app.UseSwaggerUI();

            app.MapControllers();
            app.MapHealthChecks("/health");

            Console.WriteLine("=== Starting minimal app v2 ===");
            app.Run();
            // Временный костыль, чтобы приложение не завершалось
            while (true)
            {
                Thread.Sleep(10000);
            }
            //try
            //{
            //    var builder = WebApplication.CreateBuilder(args);

            //    builder.Configuration.AddEnvironmentVariables();

            //    // временные логи:
            //    Console.WriteLine("=== APPLICATION STARTING ===");
            //    Console.WriteLine($"Connection string: {builder.Configuration.GetConnectionString("DefaultConnection")}");

            //    builder.Services.AddDbContext<ApplicationDbContext>(options =>
            //        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            //    builder.Services.AddScoped<IUserRepository, UserRepository>();
            //    builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
            //    builder.Services.AddScoped<IAuthService, AuthService>();
            //    builder.Services.AddScoped<IPropertyService, PropertyService>();
            //    builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
            //    builder.Services.AddScoped<IBookingRepository, BookingRepository>();
            //    builder.Services.AddScoped<IBookingService, BookingService>();
            //    builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
            //    builder.Services.AddScoped<IReviewService, ReviewService>();
            //    builder.Services.AddScoped<IPaymentService, PaymentService>();
            //    builder.Services.AddScoped<IPropertyViewRepository, PropertyViewRepository>();

            //    // Настройка JWT аутентификации
            //    var jwtSecret = builder.Configuration["JwtSettings:Secret"];
            //    var key = Encoding.ASCII.GetBytes(jwtSecret);

            //    builder.Services.AddAuthentication(options =>
            //    {
            //        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            //        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            //    })
            //    .AddJwtBearer(options =>
            //    {
            //        options.RequireHttpsMetadata = false; // поменять в продакшене
            //        options.SaveToken = true;

            //        options.TokenValidationParameters = new TokenValidationParameters
            //        {
            //            ValidateIssuerSigningKey = true,
            //            IssuerSigningKey = new SymmetricSecurityKey(key),
            //            ValidateIssuer = true,
            //            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],

            //            ValidateAudience = true,
            //            ValidAudience = builder.Configuration["JwtSettings:Audience"],

            //            ValidateLifetime = true,
            //            ClockSkew = TimeSpan.Zero
            //        };
            //    });

            //    builder.Services.AddAuthorization();
            //    builder.Services.AddControllers();
            //    builder.Services.AddEndpointsApiExplorer();

            //    builder.Services.AddSwaggerGen(c =>
            //    {
            //        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            //        {
            //            Name = "Authorization",
            //            Type = SecuritySchemeType.ApiKey,
            //            Scheme = "Bearer",
            //            BearerFormat = "JWT",
            //            In = ParameterLocation.Header,
            //            Description = "Enter 'Bearer [token]'"
            //        });
            //        c.AddSecurityRequirement(new OpenApiSecurityRequirement
            //    {
            //        {
            //            new OpenApiSecurityScheme
            //            {
            //                Reference = new OpenApiReference
            //                {
            //                    Type = ReferenceType.SecurityScheme,
            //                    Id = "Bearer"
            //                }
            //            },
            //            new string[] {}
            //        }
            //    });
            //    });

            //    // CORS
            //    builder.Services.AddCors(options =>
            //    {
            //        options.AddPolicy("AllowReactApp", policy =>
            //        {
            //            policy.WithOrigins(
            //                "http://localhost:3000",
            //                "https://housing-rental-app.vercel.app",
            //                "https://housing-rental-aszuijnk3-andreys27s-projects.vercel.app/")
            //                .AllowAnyHeader()
            //                .AllowAnyMethod()
            //                .AllowCredentials();
            //        });
            //    });

            //    var app = builder.Build();

            //    if (app.Environment.IsDevelopment())
            //    {
            //        app.UseSwagger();
            //        app.UseSwaggerUI();
            //    }

            //    app.UseCors("AllowReactApp");
            //    //app.UseHttpsRedirection();

            //    app.UseAuthentication();
            //    app.UseAuthorization();

            //    app.MapControllers();
            //    app.UseStaticFiles();

            //    Console.WriteLine("=== Application configured, starting run ===");
            //    app.Run();
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine($"FATAL ERROR: {ex.Message}");
            //    Console.WriteLine(ex.StackTrace);
            //    throw;
            //}
        }
    }
}
