using DGSV.Api.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Models
{
    [Table("GroupQuestion")]
    public class GroupQuestion
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<QuestionList> QuestionLists { get; set; }

    }
}
